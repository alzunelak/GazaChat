// home.js

// Elements
const fab = document.getElementById('fab');
const fabMenu = document.getElementById('fabMenu');
const qrModal = document.getElementById('qrModal');
const qrCodeDiv = document.getElementById('qrCode');
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const startVideoBtn = document.getElementById('startVideoBtn');
const stopVideoBtn = document.getElementById('stopVideoBtn');
const photoCanvas = document.getElementById('photoCanvas');
const recordedVideo = document.getElementById('recordedVideo');
const usernameDisplay = document.getElementById('usernameDisplay');
const userPic = document.getElementById('userPic');
const friendsList = document.getElementById('friendsList');
const noMsgText = document.getElementById('noMsgText');

// Load stored profile data
const storedName = localStorage.getItem('profileName') || "Your Name";
const storedPic = localStorage.getItem('profilePic') || "https://via.placeholder.com/150";
usernameDisplay.textContent = storedName;
userPic.src = storedPic;

// Generate QR code with username
QRCode.toCanvas(qrCodeDiv, storedName, { width:200 }, function (error) {
  if (error) console.error(error);
});

// Handle FAB toggle
fab.addEventListener('click', () => {
  fabMenu.style.display = fabMenu.style.display === 'flex' ? 'none' : 'flex';
});

// FAB Menu Buttons
document.getElementById('myCodeBtn').addEventListener('click', () => {
  qrModal.style.display = 'flex';
  fabMenu.style.display = 'none';
});

document.getElementById('scanQRBtn').addEventListener('click', () => {
  alert("Open camera to scan friend's QR code.");
  fabMenu.style.display = 'none';
});

document.getElementById('searchFriendBtn').addEventListener('click', () => {
  window.location.href = 'search.html';
  fabMenu.style.display = 'none';
});

document.getElementById('cameraBtn').addEventListener('click', async () => {
  fabMenu.style.display = 'none';
  cameraModal.style.display = 'flex';
  recordedVideo.style.display = 'none';
  photoCanvas.style.display = 'none';
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
    cameraVideo.srcObject = mediaStream;
  } catch(err) {
    alert("Camera access denied: " + err);
  }
});

// Close QR Modal
function closeQR() {
  qrModal.style.display = 'none';
}

// Camera variables
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];

// Take Photo
takePhotoBtn.addEventListener('click', () => {
  if(!mediaStream) return;
  photoCanvas.width = cameraVideo.videoWidth;
  photoCanvas.height = cameraVideo.videoHeight;
  photoCanvas.getContext('2d').drawImage(cameraVideo, 0, 0);
  photoCanvas.style.display = 'block';
  recordedVideo.style.display = 'none';
});

// Start Video Recording
startVideoBtn.addEventListener('click', () => {
  if(!mediaStream) return;
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(mediaStream);
  mediaRecorder.ondataavailable = e => { if(e.data.size>0) recordedChunks.push(e.data); };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type:'video/webm' });
    recordedVideo.src = URL.createObjectURL(blob);
    recordedVideo.style.display = 'block';
    photoCanvas.style.display = 'none';
  };
  mediaRecorder.start();
});

// Stop Video Recording
stopVideoBtn.addEventListener('click', () => {
  if(mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
});

// Close Camera Modal
function closeCamera(){
  cameraModal.style.display = 'none';
  if(mediaStream){
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

// Load friends added from search.html
function loadFriends() {
  friendsList.innerHTML = '';
  const friends = JSON.parse(localStorage.getItem('friendsList') || "[]");
  if(friends.length === 0){
    noMsgText.style.display = 'block';
  } else {
    noMsgText.style.display = 'none';
    friends.forEach(friend => {
      const div = document.createElement('div');
      div.className = 'friend';
      div.innerHTML = `<img src="https://via.placeholder.com/50" alt="Profile"><span>${friend}</span>`;
      div.addEventListener('click', () => {
        localStorage.setItem('currentFriend', friend);
        window.location.href = 'chat.html';
      });
      friendsList.appendChild(div);
    });
  }
}

// Check for new friend from search.html
window.addEventListener('DOMContentLoaded', () => {
  const newFriend = localStorage.getItem('newFriend');
  if(newFriend){
    let friends = JSON.parse(localStorage.getItem('friendsList') || "[]");
    if(!friends.includes(newFriend)){
      friends.push(newFriend);
      localStorage.setItem('friendsList', JSON.stringify(friends));
    }
    localStorage.removeItem('newFriend');
  }
  loadFriends();
});
