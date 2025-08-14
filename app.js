const s1 = document.getElementById('screen1');
const s2 = document.getElementById('screen2'); // Profile setup
const s3 = document.getElementById('screen3'); // Home
const s4 = document.getElementById('screen4'); // Chat

const saveProfileBtn = document.getElementById('saveProfileBtn');

// Auto transition from splash -> profile setup
window.addEventListener('load', () => {
  setTimeout(() => {
    s1.classList.add('fade-out'); // fade out
    setTimeout(() => {
      s1.classList.add('hidden');
      s1.classList.remove('active');

      // Show profile setup screen
      s2.classList.remove('hidden');
      s2.classList.add('active');
    }, 1000); // match CSS fade duration
  }, 2000); // keep splash visible for 2 seconds
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

  s2.classList.add('hidden');
  s2.classList.remove('active');
  s3.classList.remove('hidden');
  s3.classList.add('active');
});

function loadHome() {
  const name = localStorage.getItem('chatName') || 'User';
  const pic = localStorage.getItem('chatPic') || 'default-profile.png';
  document.getElementById('displayName').textContent = name;
  document.getElementById('userPic').src = pic;

  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, { text: name, width: 128, height: 128 });
}

// Chat messages as bubbles
document.getElementById('startChatBtn').addEventListener('click', () => {
  s3.classList.add('hidden');
  s4.classList.remove('hidden');
});

document.getElementById('sendBtn').addEventListener('click', () => {
  const msg = document.getElementById('messageInput').value.trim();
  if (!msg) return;
  const box = document.getElementById('chatBox');
  const p = document.createElement('div'); 
  p.className='bubble you'; 
  p.textContent = msg;
  box.appendChild(p); 
  document.getElementById('messageInput').value = '';
  box.scrollTop = box.scrollHeight;
});
