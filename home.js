const fab = document.getElementById('fab');
const fabMenu = document.getElementById('fabMenu');
const qrModal = document.getElementById('qrModal');
const qrCodeDiv = document.getElementById('qrCode');
const usernameDisplay = document.getElementById('usernameDisplay');
const userPic = document.getElementById('userPic');
const friendsList = document.getElementById('friendsList');

// Load profile
const storedName = localStorage.getItem('profileName') || "Your Name";
const storedPic = localStorage.getItem('profilePic') || "https://via.placeholder.com/150";
usernameDisplay.textContent = storedName;
userPic.src = storedPic;

// Load friends
function loadFriends(){
  friendsList.innerHTML = '';
  let friends = JSON.parse(localStorage.getItem('friendsList') || "[]");
  if(friends.length === 0){
    document.getElementById('noMsgText').style.display = 'block';
  } else {
    document.getElementById('noMsgText').style.display = 'none';
    friends.forEach(f => {
      const div = document.createElement('div');
      div.className = 'friend';
      div.innerHTML = `<img src="https://via.placeholder.com/50" alt="Friend"><span>${f}</span>`;
      div.onclick = () => {
        localStorage.setItem('currentFriend', f);
        window.location.href='chat.html';
      }
      friendsList.appendChild(div);
    });
  }
}
loadFriends();

// FAB toggle
fab.addEventListener('click', () => {
  fabMenu.style.display = fabMenu.style.display === 'flex' ? 'none' : 'flex';
});

// QR code
QRCode.toCanvas(qrCodeDiv, storedName, { width:200 }, function (error) { if (error) console.error(error) });

// FAB buttons
document.getElementById('myCodeBtn').addEventListener('click', ()=> qrModal.style.display='flex');
document.getElementById('scanQRBtn').addEventListener('click', ()=> alert("Scan friend's QR code"));
document.getElementById('searchFriendBtn').addEventListener('click', ()=> window.location.href='search.html');

// Camera FAB
let mediaStream, mediaRecorder, recordedChunks=[];
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const startVideoBtn = document.getElementById('startVideoBtn');
const stopVideoBtn = document.getElementById('stopVideoBtn');
const photoCanvas = document.getElementById('photoCanvas');
const recordedVideo = document.getElementById('recordedVideo');

document.getElementById('cameraBtn').addEventListener('click', async ()=>{
  fabMenu.style.display='none';
  const friend = prompt("Enter friend's name to send media:")||"";
  if(!friend) return alert("Friend name required.");
  
  cameraModal.style.display='flex';
  recordedVideo.style.display='none';
  photoCanvas.style.display='none';
  
  try{ mediaStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    cameraVideo.srcObject = mediaStream;
  } catch(err){ alert("Camera access denied: "+err); }

  takePhotoBtn.onclick = ()=>{
    photoCanvas.width = cameraVideo.videoWidth;
    photoCanvas.height = cameraVideo.videoHeight;
    photoCanvas.getContext('2d').drawImage(cameraVideo,0,0);
    photoCanvas.style.display='block';
    recordedVideo.style.display='none';
    saveMedia(friend,{image:photoCanvas.toDataURL("image/png")});
    alert("Photo sent to "+friend);
  };

  startVideoBtn.onclick = ()=>{
    recordedChunks=[];
    mediaRecorder=new MediaRecorder(mediaStream);
    mediaRecorder.ondataavailable = e=>{ if(e.data.size>0) recordedChunks.push(e.data); };
    mediaRecorder.onstop=()=>{
      const blob = new Blob(recordedChunks,{type:'video/webm'});
      const url = URL.createObjectURL(blob);
      recordedVideo.src=url;
      recordedVideo.style.display='block';
      photoCanvas.style.display='none';
      saveMedia(friend,{video:url});
      alert("Video sent to "+friend);
    };
    mediaRecorder.start();
  };

  stopVideoBtn.onclick = ()=>{ if(mediaRecorder && mediaRecorder.state!=='inactive') mediaRecorder.stop(); };
});

// Save media
function saveMedia(friend, mediaObj){
  let chats = JSON.parse(localStorage.getItem('chat_'+friend)||"[]");
  chats.push({type:'sent', ...mediaObj});
  localStorage.setItem('chat_'+friend, JSON.stringify(chats));
  // Update storage to trigger chat update
  localStorage.setItem('chat_update_'+friend, Date.now());
}

function closeCamera(){ cameraModal.style.display='none'; if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); } }
function closeQR(){ qrModal.style.display='none'; }
