// Screens
const s1 = document.getElementById('screen1');
const s2 = document.getElementById('screen2');
const s3 = document.getElementById('screen3');
const s4 = document.getElementById('screen4');

// Elements
const saveProfileBtn = document.getElementById('saveProfileBtn');
const scanQRBtn = document.getElementById('scanQRBtn');
const startChatBtn = document.getElementById('startChatBtn');
const friendsUl = document.getElementById('friendsUl');
const scannerPopup = document.getElementById('scannerPopup');

// Auto transition splash -> profile
window.addEventListener('load', () => {
  setTimeout(() => {
    s1.classList.remove('active'); s1.classList.add('hidden');
    s2.classList.remove('hidden');
  }, 1000);
});

// Profile -> Home
saveProfileBtn.addEventListener('click', async () => {
  const name = document.getElementById('usernameInput').value.trim();
  if(!name){ alert("Please enter your name."); return; }

  const picFile = document.getElementById('profilePicInput').files[0];
  if(picFile){
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('chatPic', reader.result);
      localStorage.setItem('chatName', name);
      loadHome();
    };
    reader.readAsDataURL(picFile);
  } else {
    localStorage.setItem('chatName', name);
    loadHome();
  }

  s2.classList.add('hidden'); s3.classList.remove('hidden');
});

// Load home screen
function loadHome(){
  const name = localStorage.getItem('chatName') || 'User';
  const pic = localStorage.getItem('chatPic') || 'default-profile.png';
  document.getElementById('displayName').textContent = name;
  document.getElementById('userPic').src = pic;

  const qrContainer = document.getElementById('qrcode'); qrContainer.innerHTML='';
  new QRCode(qrContainer, JSON.stringify({u: name}));
}

// Start chat
startChatBtn.addEventListener('click', () => {
  s3.classList.add('hidden'); s4.classList.remove('hidden');
});

// Send message
document.getElementById('sendBtn').addEventListener('click', sendMessage);
function sendMessage(){
  const msg = document.getElementById('messageInput').value.trim();
  if(!msg) return;
  const box = document.getElementById('chatBox');
  const p = document.createElement('div'); p.className='bubble you'; p.textContent=msg;
  box.appendChild(p); box.scrollTop=box.scrollHeight;
  document.getElementById('messageInput').value='';
}

// Receive message (demo)
function onIncomingMessage(text, fromName){
  const box = document.getElementById('chatBox');
  const p = document.createElement('div'); p.className='bubble friend'; p.textContent=`${fromName}: ${text}`;
  box.appendChild(p); box.scrollTop=box.scrollHeight;
}

// QR scanner
scanQRBtn.addEventListener('click', ()=>{
  scannerPopup.classList.remove('hidden');
  const qrScanner = new Html5Qrcode("reader");
  qrScanner.start({facingMode:"environment"}, {fps:10, qrbox:Math.min(window.innerWidth,300)},
    async decodedText=>{
      await qrScanner.stop();
      scannerPopup.classList.add('hidden');
      const li=document.createElement('li'); li.textContent=decodedText; friendsUl.appendChild(li);
      startChatBtn.classList.remove('hidden');
    },
    err=>console.log(err)
  );
});
