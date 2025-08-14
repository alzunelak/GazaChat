/* ===== Web Bluetooth + ECDH + AES-GCM ===== */
// Keep all your existing crypto and BLE functions:
// generateECKeyPair(), exportPublicJwk(), importPeerPublicKey(),
// deriveAesKey(), encryptMessage(), decryptMessage(),
// createProfileAndQr(), handleScannedQrPayload(),
// connectToFriendDevice(), onIncomingMessage()

/* ----- Mobile UI Navigation + QR + Chat ----- */
const s1 = document.getElementById('screen1');
const s2 = document.getElementById('screen2');
const s3 = document.getElementById('screen3');
const s4 = document.getElementById('screen4');

const continueBtn = document.getElementById('continueBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const scanQRBtn = document.getElementById('scanQRBtn');
const friendsUl = document.getElementById('friendsUl');
const startChatBtn = document.getElementById('startChatBtn');
const scannerPopup = document.getElementById('scannerPopup');

// Logo -> Profile
continueBtn.addEventListener('click', () => {
  s1.classList.add('hidden');
  s2.classList.remove('hidden');
  document.getElementById('usernameInput').focus();
});

// Profile -> Home
saveProfileBtn.addEventListener('click', async () => {
  const name = document.getElementById('usernameInput').value.trim();
  const picFile = document.getElementById('profilePicInput').files[0];
  if (!name) return alert("Please enter your name.");

  localStorage.setItem('chatName', name);

  if (picFile) {
    const reader = new FileReader();
    reader.onload = async () => {
      localStorage.setItem('chatPic', reader.result);
      await setupProfileKeys(name);
      loadHome();
    };
    reader.readAsDataURL(picFile);
  } else {
    await setupProfileKeys(name);
    loadHome();
  }

  s2.classList.add('hidden');
  s3.classList.remove('hidden');
});

// Initialize ECDH keys and render QR
async function setupProfileKeys(username) {
  const qrPayload = await createProfileAndQr(username);
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, qrPayload);
}

// Load Home
function loadHome() {
  const name = localStorage.getItem('chatName') || 'User';
  const pic = localStorage.getItem('chatPic') || 'default-profile.png';
  document.getElementById('displayName').textContent = name;
  document.getElementById('userPic').src = pic;
}

// Start Chat
startChatBtn.addEventListener('click', () => {
  s3.classList.add('hidden');
  s4.classList.remove('hidden');
});

// Send Chat Messages
document.getElementById('sendBtn').addEventListener('click', async () => {
  const msg = document.getElementById('messageInput').value.trim();
  if (!msg) return;

  const friend = window.currentFriend;
  const conn = window.currentConn;
  const box = document.getElementById('chatBox');

  // Display locally
  const p = document.createElement('div');
  p.className = 'bubble you';
  p.textContent = msg;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;

  // Send via BLE
  if (conn && friend && friend.aesKey) {
    await conn.send(msg, friend.aesKey);
  }

  document.getElementById('messageInput').value = '';
});

// Incoming messages displayed as friend bubble
function onIncomingMessage(text, fromName) {
  const box = document.getElementById('chatBox');
  const p = document.createElement('div');
  p.className = 'bubble friend';
  p.textContent = `${fromName}: ${text}`;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

// QR Scanner Fullscreen + Add Friend + Start Chat
scanQRBtn.addEventListener('click', () => {
  scannerPopup.classList.remove('hidden');

  const qrScanner = new Html5Qrcode("reader");
  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: Math.min(window.innerWidth, 300) },
    async (decodedText) => {
      await qrScanner.stop();
      scannerPopup.classList.add('hidden');

      const { name, aesKey } = await handleScannedQrPayload(decodedText);
      window.currentFriend = { name, aesKey };

      const li = document.createElement('li');
      li.textContent = name;
      friendsUl.appendChild(li);

      try { window.currentConn = await connectToFriendDevice({ namePrefix: name }); }
      catch(e){ console.warn('BLE connection failed:', e); }

      startChatBtn.classList.remove('hidden');
    },
    (err) => console.log(err)
  );
});
