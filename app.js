// Mobile-friendly buttons
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

// Handle mobile click + touch
function goToProfile() {
  s1.classList.add('hidden');
  s2.classList.remove('hidden');
}
continueBtn.addEventListener('click', goToProfile);
continueBtn.addEventListener('touchend', (e)=>{ e.preventDefault(); goToProfile(); });

// Profile -> Home
saveProfileBtn.addEventListener('click', async () => {
  const name = document.getElementById('usernameInput').value.trim();
  const picFile = document.getElementById('profilePicInput').files[0];
  if(!name) return alert("Please enter your name.");
  localStorage.setItem('chatName', name);

  if(picFile){
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
  s2.classList.add('hidden'); s3.classList.remove('hidden');
});

// ECDH + QR functions placeholders
async function setupProfileKeys(username){
  const payloadStr = JSON.stringify({u: username, k:"PUBLIC_KEY"}); // replace with real createProfileAndQr
  const qrContainer = document.getElementById('qrcode'); qrContainer.innerHTML='';
  new QRCode(qrContainer, payloadStr);
}

function loadHome(){
  const name = localStorage.getItem('chatName') || 'User';
  const pic = localStorage.getItem('chatPic') || 'default-profile.png';
  document.getElementById('displayName').textContent = name;
  document.getElementById('userPic').src = pic;
}

// Chat messages
startChatBtn.addEventListener('click', () => { s3.classList.add('hidden'); s4.classList.remove('hidden'); });
document.getElementById('sendBtn').addEventListener('click', sendMessage);

function sendMessage(){
  const msg = document.getElementById('messageInput').value.trim();
  if(!msg) return;
  const box = document.getElementById('chatBox');
  const p = document.createElement('div'); p.className='bubble you'; p.textContent=msg;
  box.appendChild(p); box.scrollTop=box.scrollHeight;
  document.getElementById('messageInput').value='';
}

// Incoming messages
function onIncomingMessage(text, fromName){
  const box = document.getElementById('chatBox');
  const p = document.createElement('div'); p.className='bubble friend'; p.textContent=`${fromName}: ${text}`;
  box.appendChild(p); box.scrollTop=box.scrollHeight;
}

// QR scanner example
scanQRBtn.addEventListener('click', ()=>{
  scannerPopup.classList.remove('hidden');
  const qrScanner = new Html5Qrcode("reader");
  qrScanner.start({facingMode:"environment"}, {fps:10, qrbox:Math.min(window.innerWidth,300)},
    async decodedText=>{
      await qrScanner.stop();
      scannerPopup.classList.add('hidden');
      // Handle friend
      const friendName = decodedText; // placeholder
      const li=document.createElement('li'); li.textContent=friendName; friendsUl.appendChild(li);
      startChatBtn.classList.remove('hidden');
    },
    err=>console.log(err)
  );
});
