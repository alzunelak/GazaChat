/* ===== Web Bluetooth + ECDH (P-256) + AES-GCM messaging =====
   Drop into your app.js or include on pages that need Bluetooth.
   - Use QR payload: { u: username, k: publicKeyJwk }
   - Service/characteristic UUIDs below are sample; both sides must use same UUIDs.
   - Works when the other device is advertising a BLE GATT peripheral exposing the service.
   - For phone↔phone with advertising, use a native app/Capacitor plugin.
*/

const BLE_SERVICE_UUID = '0000feed-0000-1000-8000-00805f9b34fb';     // example service UUID
const BLE_CHAR_TX_UUID  = '0000beef-0000-1000-8000-00805f9b34fb';    // write here (to peripheral)
const BLE_CHAR_RX_UUID  = '0000cafe-0000-1000-8000-00805f9b34fb';    // notify from peripheral

// --- Crypto helpers (WebCrypto) ---
async function generateECKeyPair() {
  return crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, // extractable public key so we can send it in QR
    ["deriveKey", "deriveBits"]
  );
}

async function exportPublicJwk(publicKey) {
  return crypto.subtle.exportKey("jwk", publicKey); // JSON Web Key object
}

async function importPeerPublicKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

/* derive AES-GCM 256-bit key from ECDH */
async function deriveAesKey(privateKey, peerPublicKey) {
  // derive raw bits then import as AES-GCM key
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: peerPublicKey },
    privateKey,
    256
  ); // 256 bits

  return crypto.subtle.importKey(
    "raw",
    derivedBits,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/* AES-GCM encrypt/decrypt helpers. We prepend IV to ciphertext. */
function encodeUtf8(s){ return new TextEncoder().encode(s); }
function decodeUtf8(b){ return new TextDecoder().decode(b); }

async function encryptMessage(aesKey, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pt = encodeUtf8(plaintext);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv, tagLength: 128 },
    aesKey,
    pt
  );
  // return base64 of (iv + ciphertext)
  const combined = new Uint8Array(iv.byteLength + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptMessage(aesKey, b64) {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const ct = raw.slice(12);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv, tagLength: 128 },
    aesKey,
    ct
  );
  return decodeUtf8(new Uint8Array(pt));
}

/* ----- QR creation for profile (call once after generating keypair) ----- */
async function createProfileAndQr(username) {
  // generate keys and store privateKey in sessionStorage for demo (for production: Keystore)
  const kp = await generateECKeyPair();
  const pubJwk = await exportPublicJwk(kp.publicKey);
  // store private key in IndexedDB/session for this session (in-memory-like)
  // we keep the privateKey as CryptoKey in window.sessionKeys
  window.sessionKeys = window.sessionKeys || {};
  window.sessionKeys.privateKey = kp.privateKey;
  window.sessionKeys.publicJwk = pubJwk;

  // create QR payload
  const payload = { u: username, k: pubJwk }; // include JWK directly
  const payloadStr = JSON.stringify(payload);
  // render QR using your existing QR lib (qrcode.min.js)
  // e.g. new QRCode(document.getElementById('qrcode'), payloadStr);

  return payloadStr;
}

/* ----- When scanning friend QR: import their key and derive AES key ----- */
async function handleScannedQrPayload(decodedText) {
  // decodedText may be JSON with {u,k} or a plain username
  let parsed;
  try { parsed = JSON.parse(decodedText); } catch(e) { parsed = null; }

  if(!parsed || !parsed.k) {
    // no public key included — cannot derive secure key; fallback to plaintext or prompt user.
    console.warn('Scanned QR contains no public key; secure chat not available.');
    const friendName = parsed && parsed.u ? parsed.u : decodedText;
    storeFriend(friendName, null);
    return { name: friendName, aesKey: null };
  }

  const friendName = parsed.u || 'Friend';
  const peerJwk = parsed.k;

  // import peer public key
  const peerPubKey = await importPeerPublicKey(peerJwk);
  // get our privateKey
  const priv = window.sessionKeys && window.sessionKeys.privateKey;
  if(!priv) {
    throw new Error('No private key available in session. Generate profile keys first.');
  }
  const aesKey = await deriveAesKey(priv, peerPubKey);
  // add friend to storage with peerJwk for later use
  storeFriend(friendName, peerJwk);
  return { name: friendName, aesKey: aesKey };
}

/* ----- storage helpers for friends (simple localStorage JSON) ----- */
function storeFriend(name, peerJwk) {
  const friends = JSON.parse(localStorage.getItem('friends') || '[]');
  if(!friends.find(f => f.name === name)) {
    friends.push({ name, peerJwk });
    localStorage.setItem('friends', JSON.stringify(friends));
  }
}

/* ----- Web Bluetooth connection logic (central) ----- */
async function connectToFriendDevice(filters = { namePrefix: '' }) {
  if(!navigator.bluetooth) throw new Error('Web Bluetooth not supported in this browser.');

  // try to request a device that advertises our service or matches name
  let opt = {
    acceptAllDevices: false,
    optionalServices: [BLE_SERVICE_UUID],
    filters: []
  };

  // If user gave a name prefix, use it
  if(filters.namePrefix) {
    opt.filters.push({ namePrefix: filters.namePrefix });
  } else {
    // fallback: request devices advertising service
    opt.filters.push({ services: [BLE_SERVICE_UUID] });
  }

  // show chooser
  const device = await navigator.bluetooth.requestDevice(opt);
  if(!device) throw new Error('No device selected');

  // connect GATT
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(BLE_SERVICE_UUID);

  // get tx (write) and rx (notify) characteristics
  const txChar = await service.getCharacteristic(BLE_CHAR_TX_UUID); // write to peripheral
  const rxChar = await service.getCharacteristic(BLE_CHAR_RX_UUID); // notify from peripheral

  // set up notification handler
  await rxChar.startNotifications();
  rxChar.addEventListener('characteristicvaluechanged', async (evt) => {
    const value = evt.target.value; // DataView
    // we expect the peripheral to send base64 text as UTF-8
    const bytes = new Uint8Array(value.buffer);
    const text = new TextDecoder().decode(bytes);
    // try to decrypt if we have aesKey
    const friend = getCurrentFriend(); // implement to retrieve current friend info (name, peerJwk)
    if(friend && friend.aesKey) {
      try {
        const plaintext = await decryptMessage(friend.aesKey, text);
        onIncomingMessage(plaintext, friend.name);
      } catch (e) {
        console.warn('Decrypt failed, delivering raw:', e);
        onIncomingMessage(text, friend.name);
      }
    } else {
      onIncomingMessage(text, friend ? friend.name : 'Friend');
    }
  });

  // return object for sending
  return {
    device, server, txChar, rxChar,
    async send(text, aesKey = null) {
      let payload;
      if(aesKey) {
        payload = await encryptMessage(aesKey, text); // base64 string
      } else {
        payload = text;
      }
      const bytes = new TextEncoder().encode(payload);
      // writeValue expects ArrayBuffer
      await txChar.writeValue(bytes);
    },
    async disconnect() {
      try { rxChar.stopNotifications(); } catch(e){}
      try { await server.disconnect(); } catch(e){ if(device.gatt.connected) device.gatt.disconnect(); }
    }
  };
}

/* ----- Helpers to integrate into UI callbacks ----- */
function onIncomingMessage(text, fromName) {
  // Add to chat box (adapt to your UI)
  console.log('Incoming message from', fromName, ':', text);
  // If you have messages DOM:
  const box = document.getElementById('chatBox') || document.getElementById('messages');
  if(box) {
    const p = document.createElement('div');
    p.className = 'bubble friend';
    p.textContent = `${fromName}: ${text}`;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
  }
}

/* ----- Example integration usage (UI flows) ----- */

/* 1) When creating profile: call createProfileAndQr(username) to create crypto keys
      then render the QR with the returned payload.
   2) When scanning friend's QR, call handleScannedQrPayload(decodedText) to get aesKey.
   3) Then call connectToFriendDevice({namePrefix: friendName}) to select & connect device.
   4) Use connection.send(message, aesKey) to send encrypted message.
*/

// small convenience: export profile public JWK for QR generation
async function getMyProfileQrPayload() {
  // ensure keys exist
  if(!(window.sessionKeys && window.sessionKeys.publicJwk)) {
    throw new Error('No keypair in session. Call createProfileAndQr(name) at profile creation time.');
  }
  const prof = JSON.parse(localStorage.getItem('profile') || '{}');
  const payload = { u: prof.name || 'You', k: window.sessionKeys.publicJwk };
  return JSON.stringify(payload);
}

/* Example quick UI wiring (adapt to your app):
   - After user sets up profile, run createProfileAndQr(name) and render QR with QR library.
   - On scan.html, when you get decodedText from html5-qrcode, call:
       const { name, aesKey } = await handleScannedQrPayload(decodedText);
       // store friend and keep aesKey in memory:
       window.currentFriend = { name, aesKey };
       // then call connectToFriendDevice({ namePrefix: name });
       const conn = await connectToFriendDevice({ namePrefix: name });
       // Save conn for later:
       window.currentConn = conn;
       // To send:
       await conn.send('hello', window.currentFriend.aesKey);
*/

