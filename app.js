const s1 = document.getElementById('screen1');
const s2 = document.getElementById('screen2');
const s3 = document.getElementById('screen3');
const s4 = document.getElementById('screen4');

const saveProfileBtn = document.getElementById('saveProfileBtn');

// Auto transition from splash -> profile setup
window.addEventListener('load', () => {
  setTimeout(() => {
    s1.classList.remove('active'); s1.classList.add('hidden');
    s2.classList.remove('hidden');
  }, 1000); // 1 second
});

// Save profile and go to home
saveProfileBtn.addEventListener('click', () => {
  const name = document.getElementById('usernameInput').value.trim();
  const picFile = document.getElementById('profilePicInput').files[0];

  if (!name) { alert("Please enter your name."); return; }

  localStorage.setItem('chatName', name);

  if (picFile) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('chatPic', reader.result);
      loadHome();
    };
    reader.readAsDataURL(picFile);
  } else { loadHome(); }

  s2.classList.add('hidden'); s3.classList.remove('hidden');
});

function loadHome() {
  const name = localStorage.getItem('chatName') || 'User';
  const pic = localStorage.getItem('chatPic') || 'default-profile.png';
  document.getElementById('displayName').textContent = name;
  document.getElementById('userPic').src = pic;

  // Generate QR
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, { text: name, width: 128, height: 128 });
}

// Chat messages as bubbles
document.getElementById('startChatBtn').addEventListener('click', () => {
  s3.classList.add('hidden'); s4.classList.remove('hidden');
});

document.getElementById('sendBtn').addEventListener('click', () => {
  const msg = document.getElementById('messageInput').value.trim();
  if (!msg) return;
  const box = document.getElementById('chatBox');
  const p = document.createElement('div'); p.className='bubble you'; p.textContent = msg;
  box.appendChild(p); document.getElementById('messageInput').value = '';
  box.scrollTop = box.scrollHeight;
});
