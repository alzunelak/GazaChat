/* ===== Web Bluetooth + ECDH + AES-GCM helpers ===== */
const BLE_SERVICE_UUID = '0000feed-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_TX_UUID  = '0000beef-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_RX_UUID  = '0000cafe-0000-1000-8000-00805f9b34fb';

// ----- Crypto helpers -----
async function generateECKeyPair() {
  return crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey","deriveBits"]
  );
}

async function exportPublicJwk(publicKey) {
  return crypto.subtle.exportKey("jwk", publicKey);
}

async function importPeerPublicKey(jwk) {
  return crypto.subtle.importKey("jwk", jwk, { name:"ECDH", namedCurve:"P-256"}, true, []);
}

async function deriveAesKey(privateKey, peerPublicKey) {
  const derivedBits = await crypto.subtle.deriveBits(
    { name:"ECDH", public:peerPublicKey },
    privateKey,
    256
  );
  return crypto.subtle.importKey(
    "raw",
    derivedBits,
    { name:"AES-GCM" },
    false,
    ["encrypt","decrypt"]
  );
}

function encodeUtf8(str){ return new TextEncoder().encode(str); }
function decodeUtf8(buf){ return new TextDecoder().decode(buf); }

async function encryptMessage(aesKey, plaintext){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name:"AES-GCM", iv, tagLength:128 }, aesKey, encodeUtf8(plaintext));
  const combined = new Uint8Array(iv.byteLength + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptMessage(aesKey, b64){
  const raw = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
  const iv = raw.slice(0,12);
  const ct = raw.slice(12);
  const pt = await crypto.subtle.decrypt({ name:"AES-GCM", iv, tagLength:128 }, aesKey, ct);
  return decodeUtf8(new Uint8Array(pt));
}

/* ----- Profile + QR ----- */
async function createProfileAndQr(username){
  const kp = await generateECKeyPair();
  const pubJwk = await exportPublicJwk(kp.publicKey);
  window.sessionKeys = window.sessionKeys||{};
  window.sessionKeys.privateKey = kp.privateKey;
  window.sessionKeys.publicJwk = pubJwk;

  const payload = { u: username, k: pubJwk };
  return JSON.stringify(payload);
}

async function handleScannedQrPayload(decodedText){
  let parsed;
  try{ parsed = JSON.parse(decodedText); } catch(e){ parsed = null; }

  if(!parsed || !parsed.k){
    const friendName = parsed?.u || decodedText;
    storeFriend(friendName, null);
    return { name: friendName, aesKey: null };
  }

  const peerPubKey = await importPeerPublicKey(parsed.k);
  const priv = window.sessionKeys?.privateKey;
  if(!priv) throw new Error("No private key in session.");

  const aesKey = await deriveAesKey(priv, peerPubKey);
  storeFriend(parsed.u, parsed.k);
  return { name: parsed.u, aesKey };
}

function storeFriend(name, peerJwk){
  const friends = JSON.parse(localStorage.getItem('friends')||'[]');
  if(!friends.find(f=>f.name===name)){
    friends.push({ name, peerJwk });
    localStorage.setItem('friends', JSON.stringify(friends));
  }
}

/* ----- Web Bluetooth ----- */
async function connectToFriendDevice(filters={namePrefix:''}){
  if(!navigator.bluetooth) throw new Error("Web Bluetooth not supported");

  const options = { acceptAllDevices:false, optionalServices:[BLE_SERVICE_UUID], filters:[] };
  if(filters.namePrefix) options.filters.push({ namePrefix:filters.namePrefix });
  else options.filters.push({ services:[BLE_SERVICE_UUID] });

  const device = await navigator.bluetooth.requestDevice(options);
  if(!device) throw new Error("No device selected");

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(BLE_SERVICE_UUID);

  const txChar = await service.getCharacteristic(BLE_CHAR_TX_UUID);
  const rxChar = await service.getCharacteristic(BLE_CHAR_RX_UUID);

  await rxChar.startNotifications();
  rxChar.addEventListener('characteristicvaluechanged', async evt=>{
    const val = new TextDecoder().decode(new Uint8Array(evt.target.value.buffer));
    const friend = window.currentFriend;
    if(friend?.aesKey){
      try{ onIncomingMessage(await decryptMessage(friend.aesKey, val), friend.name); }
      catch(e){ onIncomingMessage(val, friend.name); }
    } else onIncomingMessage(val, friend?.name || "Friend");
  });

  return {
    device, server, txChar, rxChar,
    async send(text, aesKey=null){
      let payload = aesKey? await encryptMessage(aesKey,text) : text;
      await txChar.writeValue(encodeUtf8(payload));
    },
    async disconnect(){
      try{ await rxChar.stopNotifications(); } catch{}
      try{ await server.disconnect(); } catch(e){ if(device.gatt.connected) device.gatt.disconnect(); }
    }
  };
}

/* ----- UI: screens and buttons ----- */
const s1=document.getElementById('screen1');
const s2=document.getElementById('screen2');
const s3=document.getElementById('screen3');
const s4=document.getElementById('screen4');

const continueBtn=document.getElementById('continueBtn');
const saveProfileBtn=document.getElementById('saveProfileBtn');
const scanQRBtn=document.getElementById('scanQRBtn');
const startChatBtn=document.getElementById('startChatBtn');
const friendsUl=document.getElementById('friendsUl');
const scannerPopup=document.getElementById('scannerPopup');

const chatBox=document.getElementById('chatBox');
const messageInput=document.getElementById('messageInput');
const sendBtn=document.getElementById('sendBtn');

const displayName=document.getElementById('displayName');
const userPic=document.getElementById('userPic');

// --- Navigation ---
continueBtn.addEventListener('click',()=>{ s1.classList.add('hidden'); s2.classList.remove('hidden'); });
saveProfileBtn.addEventListener('click',async ()=>{
  const name=document.getElementById('usernameInput').value.trim();
  const picFile=document.getElementById('profilePicInput').files[0];
  if(!name) return alert("Enter your name.");

  localStorage.setItem('chatName', name);
  if(picFile){
    const reader=new FileReader();
    reader.onload=async ()=>{
      localStorage.setItem('chatPic', reader.result);
      await setupProfileKeys(name);
      loadHome();
    };
    reader.readAsDataURL(picFile);
  } else { await setupProfileKeys(name); loadHome(); }
  s2.classList.add('hidden'); s3.classList.remove('hidden');
});

async function setupProfileKeys(username){
  const qrPayload=await createProfileAndQr(username);
  const qrContainer=document.getElementById('qrcode');
  qrContainer.innerHTML='';
  new QRCode(qrContainer, qrPayload);
}

function loadHome(){
  const name=localStorage.getItem('chatName')||'User';
  const pic=localStorage.getItem('chatPic')||'default-profile.png';
  displayName.textContent=name;
  userPic.src=pic;
}

// --- Chat ---
startChatBtn.addEventListener('click',()=>{ s3.classList.add('hidden'); s4.classList.remove('hidden'); });
sendBtn.addEventListener('click', async ()=>{
  const msg=messageInput.value.trim(); if(!msg) return;

  // show locally
  const p=document.createElement('div'); p.className='bubble you'; p.textContent=msg; chatBox.appendChild(p);
  chatBox.scrollTop=chatBox.scrollHeight;

  // send to friend if connected
  if(window.currentConn && window.currentFriend?.aesKey) await window.currentConn.send(msg, window.currentFriend.aesKey);
  messageInput.value='';
});

function onIncomingMessage(text, fromName){
  const p=document.createElement('div'); p.className='bubble friend'; p.textContent=`${fromName}: ${text}`;
  chatBox.appendChild(p); chatBox.scrollTop=chatBox.scrollHeight;
}

// --- QR scanner ---
scanQRBtn.addEventListener('click',()=>{
  scannerPopup.classList.remove('hidden');
  const qrScanner=new Html5Qrcode("reader");
  qrScanner.start({facingMode:"environment"},{fps:10, qrbox:Math.min(window.innerWidth,300)},
    async decodedText=>{
      await qrScanner.stop(); scannerPopup.classList.add('hidden');
      const { name, aesKey } = await handleScannedQrPayload(decodedText);
      window.currentFriend={name, aesKey};
      const li=document.createElement('li'); li.textContent=name; friendsUl.appendChild(li);

      try{ window.currentConn = await connectToFriendDevice({namePrefix:name}); }
      catch(e){ console.warn("BLE connection failed:", e); }
      startChatBtn.classList.remove('hidden');
    },
    err=>console.log(err)
  );
});
