/* ============================
  Modular Chat App - app.js
  - animated transitions
  - profile cropping
  - contact search modal
  - media in chat
  - persistent localStorage
  - QR scanning (top & fab)
============================ */

const LS = {
  profile: 'chatapp_profile',
  friends: 'chatapp_friends',
  chats: 'chatapp_chats',
  groups: 'chatapp_groups',
  calls: 'chatapp_calls'
};
const $ = id => document.getElementById(id);

/* Elements */
const logoScreen = $('logoScreen');
const profileScreen = $('profileScreen');
const appContent = $('appContent');
const profilePreview = $('profilePreview');
const profileFile = $('profileFile');
const usernameInput = $('usernameInput');
const startBtn = $('startBtn');

const topProfilePic = $('topProfilePic');
const usernameDisplay = $('usernameDisplay');
const topCamera = $('topCamera');

const fab = $('fab');
const fabMenu = $('fabMenu');
const fabScan = $('fabScan');
const fabSearch = $('fabSearch');
const fabSendImage = $('fabSendImage');

const friendsContainer = $('friendsContainer');
const noChatsMsg = $('noChatsMsg');

const tabButtons = document.querySelectorAll('.tabBtn');
const tabs = { chatTab: $('chatTab'), groupsTab: $('groupsTab'), qrTab: $('qrTab'), callsTab: $('callsTab') };

const newGroupName = $('newGroupName');
const createGroupBtn = $('createGroupBtn');
const groupsContainer = $('groupsContainer');

const myQrCanvas = $('myQr');

const scannerModal = $('scannerModal');
const readerDiv = $('reader');

const searchModal = $('searchModal');
const searchInput = $('searchInput');
const searchResults = $('searchResults');
const closeSearch = $('closeSearch');

const imageModal = $('imageModal');
const sendImageFile = $('sendImageFile');
const imagePreviewWrap = $('imagePreviewWrap');
const closeImageModal = $('closeImageModal');

const clearCallsBtn = $('clearCalls');
const callsContainer = $('callsContainer');

/* state */
let profile = null;
let friends = [];
let chats = {};
let groups = {};
let calls = [];
let html5QrCode = null;

/* load/save */
function saveState(){
  localStorage.setItem(LS.profile, JSON.stringify(profile));
  localStorage.setItem(LS.friends, JSON.stringify(friends));
  localStorage.setItem(LS.chats, JSON.stringify(chats));
  localStorage.setItem(LS.groups, JSON.stringify(groups));
  localStorage.setItem(LS.calls, JSON.stringify(calls));
}
function loadState(){
  profile = JSON.parse(localStorage.getItem(LS.profile) || 'null');
  friends = JSON.parse(localStorage.getItem(LS.friends) || '[]');
  chats = JSON.parse(localStorage.getItem(LS.chats) || '{}');
  groups = JSON.parse(localStorage.getItem(LS.groups) || '{}');
  calls = JSON.parse(localStorage.getItem(LS.calls) || '[]');
}
loadState();

/* helpers */
function esc(s){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* UI render */
function applyProfile(){
  if(!profile) return;
  topProfilePic.src = profile.avatar || profilePreview.src;
  profilePreview.src = profile.avatar || profilePreview.src;
  usernameDisplay.textContent = profile.name;
  QRCode.toCanvas(myQrCanvas, profile.name, {width:180});
}
function renderFriends(){
  friendsContainer.innerHTML = '';
  if(friends.length === 0) noChatsMsg.style.display = 'block';
  else noChatsMsg.style.display = 'none';
  friends.forEach(f=>{
    const div = document.createElement('div');
    div.className = 'friendCard';
    div.innerHTML = `
      <div class="friendLeft">
        <div class="friendAvatar"><img src="${f.avatar||'https://img.icons8.com/color/96/000000/user-male-circle.png'}" style="width:100%;height:100%;border-radius:50%;object-fit:cover"></div>
        <div>
          <div style="font-weight:700">${esc(f.name)}</div>
          <div class="small">${(chats[f.name] && chats[f.name].length) ? chats[f.name].length + ' messages' : 'No messages'}</div>
        </div>
      </div>
      <div class="friendActions">
        <button data-name="${esc(f.name)}">Start Chat</button>
        <button data-call="${esc(f.name)}" style="margin-left:8px;padding:8px 10px;border-radius:8px;border:0;background:#eee;color:#111">Call</button>
      </div>`;
    friendsContainer.appendChild(div);
    div.querySelector('button[data-name]').addEventListener('click', e=> openChat(e.currentTarget.dataset.name));
    div.querySelector('button[data-call]').addEventListener('click', e=> makeCall(e.currentTarget.dataset.call));
  });
}
function renderGroups(){
  groupsContainer.innerHTML = '';
  const ids = Object.keys(groups);
  if(ids.length === 0) { groupsContainer.innerHTML = '<div class="small">No groups yet</div>'; return; }
  ids.forEach(id=>{
    const g = groups[id];
    const el = document.createElement('div');
    el.className = 'friendCard';
    el.innerHTML = `<div><div style="font-weight:700">${esc(g.name)}</div><div class="small">${g.members.length} members</div></div><div><button data-id="${id}">Open</button></div>`;
    groupsContainer.appendChild(el);
    el.querySelector('button[data-id]').addEventListener('click', ()=> openGroupChat(id));
  });
}
function renderCalls(){
  callsContainer.innerHTML = '';
  if(calls.length === 0) { callsContainer.innerHTML = '<div class="small">No call logs</div>'; return; }
  calls.slice().reverse().forEach(c=>{
    const el = document.createElement('div');
    el.className = 'friendCard';
    el.innerHTML = `<div><div style="font-weight:700">${esc(c.name)}</div><div class="small">${new Date(c.ts).toLocaleString()} • ${c.type}</div></div><div><button onclick="simulateCall('${esc(c.name)}')">Call</button></div>`;
    callsContainer.appendChild(el);
  });
}

/* profile cropping - simple rectangle crop using canvas with mouse */
const cropCanvas = document.createElement('canvas');
const cropCtx = cropCanvas.getContext('2d');
let cropImage = null;
let selecting = false, selStart = null, selRect = null;
const cropUiCanvas = $('cropCanvas');
const cropUiCtx = cropUiCanvas.getContext('2d');

function startCropWithFile(file){
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      cropImage = img;
      // show UI canvas
      cropUiCanvas.style.display = 'block';
      document.querySelector('.cropControls').style.display = 'flex';
      // set canvas size to fit
      const w = Math.min(360, img.width);
      const ratio = w / img.width;
      cropUiCanvas.width = img.width * ratio;
      cropUiCanvas.height = img.height * ratio;
      // draw scaled
      cropUiCtx.clearRect(0,0,cropUiCanvas.width,cropUiCanvas.height);
      cropUiCtx.drawImage(img, 0, 0, cropUiCanvas.width, cropUiCanvas.height);
      // initial selection is center square
      const s = Math.min(cropUiCanvas.width, cropUiCanvas.height) * 0.6;
      selRect = { x: (cropUiCanvas.width - s)/2, y: (cropUiCanvas.height - s)/2, w: s, h: s };
      drawCropOverlay();
      // attach mouse handlers
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function drawCropOverlay(){
  if(!cropUiCanvas) return;
  cropUiCtx.clearRect(0,0,cropUiCanvas.width,cropUiCanvas.height);
  cropUiCtx.drawImage(cropImage, 0, 0, cropUiCanvas.width, cropUiCanvas.height);
  // darken overlay
  cropUiCtx.fillStyle = 'rgba(0,0,0,0.35)';
  cropUiCtx.fillRect(0,0,cropUiCanvas.width,cropUiCanvas.height);
  // clear selected rect
  if(selRect){
    cropUiCtx.clearRect(selRect.x, selRect.y, selRect.w, selRect.h);
    // stroke
    cropUiCtx.strokeStyle = '#fff';
    cropUiCtx.lineWidth = 2;
    cropUiCtx.strokeRect(selRect.x + 0.5, selRect.y + 0.5, selRect.w - 1, selRect.h - 1);
  }
}
function startSelecting(e){
  selecting = true;
  const r = cropUiCanvas.getBoundingClientRect();
  selStart = { x: e.clientX - r.left, y: e.clientY - r.top };
  selRect = { x: selStart.x, y: selStart.y, w: 1, h: 1 };
  drawCropOverlay();
}
function moveSelecting(e){
  if(!selecting) return;
  const r = cropUiCanvas.getBoundingClientRect();
  const cur = { x: e.clientX - r.left, y: e.clientY - r.top };
  selRect.w = Math.abs(cur.x - selStart.x);
  selRect.h = Math.abs(cur.y - selStart.y);
  selRect.x = Math.min(cur.x, selStart.x);
  selRect.y = Math.min(cur.y, selStart.y);
  drawCropOverlay();
}
function endSelecting(e){
  selecting = false;
}
function applyCrop(){
  if(!selRect) return alert('Select crop area first');
  // compute scale back to original image
  const scale = cropImage.width / cropUiCanvas.width;
  const sx = selRect.x * scale;
  const sy = selRect.y * scale;
  const sw = selRect.w * scale;
  const sh = selRect.h * scale;
  cropCanvas.width = sw;
  cropCanvas.height = sh;
  cropCtx.clearRect(0,0,sw,sh);
  cropCtx.drawImage(cropImage, sx, sy, sw, sh, 0, 0, sw, sh);
  const dataUrl = cropCanvas.toDataURL('image/jpeg', 0.9);
  profilePreview.src = dataUrl;
  // hide crop UI
  cropUiCanvas.style.display = 'none';
  document.querySelector('.cropControls').style.display = 'none';
}
function cancelCrop(){
  cropUiCanvas.style.display = 'none';
  document.querySelector('.cropControls').style.display = 'none';
}

/* profile file handler */
profileFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  startCropWithFile(f);
});

/* crop canvas events */
cropUiCanvas.addEventListener('mousedown', startSelecting);
cropUiCanvas.addEventListener('mousemove', moveSelecting);
window.addEventListener('mouseup', endSelecting);
$('applyCrop').addEventListener('click', ()=>{
  applyCrop();
});
$('cancelCrop').addEventListener('click', ()=> cancelCrop());

/* initial flow: if profile exists skip screens */
loadState();
if(profile){
  logoScreen.style.display = 'none';
  profileScreen.style.display = 'none';
  appContent.classList.remove('hide');
  applyProfile();
  renderFriends(); renderGroups(); renderCalls();
} else {
  // show logo then profile
  setTimeout(()=>{ logoScreen.style.display = 'none'; profileScreen.style.display = 'flex'; }, 1000);
}

/* start button */
startBtn.addEventListener('click', ()=>{
  const name = (usernameInput.value || '').trim() || 'User' + Math.floor(Math.random()*900+100);
  profile = { name, avatar: profilePreview.src };
  saveState();
  applyProfile();
  profileScreen.style.display = 'none';
  appContent.classList.remove('hide');
  renderFriends(); renderGroups(); renderCalls();
});

/* tabs */
tabButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    tabButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    Object.keys(tabs).forEach(k=>tabs[k].classList.add('hidden'));
    tabs[btn.dataset.tab].classList.remove('hidden');
    if(btn.dataset.tab === 'chatTab') renderFriends();
    if(btn.dataset.tab === 'groupsTab') renderGroups();
    if(btn.dataset.tab === 'callsTab') renderCalls();
  });
});

/* FAB / search / image */
fab.addEventListener('click', ()=> fabMenu.style.display = fabMenu.style.display === 'flex' ? 'none' : 'flex');
fabScan.addEventListener('click', ()=> { openScanner('fab'); fabMenu.style.display = 'none'; });
fabSearch.addEventListener('click', ()=> {
  fabMenu.style.display = 'none';
  openSearchModal();
});
fabSendImage.addEventListener('click', ()=> {
  fabMenu.style.display = 'none';
  openImageModal();
});

/* Search modal logic (replaces prompt) */
$('closeSearch').addEventListener('click', ()=> searchModal.style.display = 'none');
function openSearchModal(){
  searchInput.value = '';
  searchResults.innerHTML = '';
  searchModal.style.display = 'flex';
  searchInput.focus();
}
searchInput.addEventListener('input', ()=>{
  const q = (searchInput.value||'').trim().toLowerCase();
  searchResults.innerHTML = '';
  // show matches in friends, plus option to add new
  const matched = friends.filter(f=>f.name.toLowerCase().includes(q));
  matched.forEach(m=>{
    const d = document.createElement('div'); d.className='friendCard';
    d.innerHTML = `<div>${esc(m.name)}</div><div><button data-add="${esc(m.name)}">Open</button></div>`;
    searchResults.appendChild(d);
    d.querySelector('button[data-add]').addEventListener('click', ()=> { searchModal.style.display='none'; openChat(m.name); });
  });
  if(q && !friends.some(f=>f.name.toLowerCase() === q)){
    const btn = document.createElement('div'); btn.style.marginTop='8px';
    btn.innerHTML = `<button class="btn primary" id="addNewFriendBtn">Add "${esc(q)}"</button>`;
    searchResults.appendChild(btn);
    btn.querySelector('#addNewFriendBtn').addEventListener('click', ()=> {
      addFriendByName(q);
      searchModal.style.display = 'none';
    });
  }
});

/* open image modal */
$('closeImageModal').addEventListener('click', ()=> imageModal.style.display='none');
sendImageFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = ()=> {
    imagePreviewWrap.innerHTML = `<img src="${r.result}" style="max-width:100%;border-radius:8px" />`;
    // option: choose friend to send to
    const choose = document.createElement('div');
    choose.innerHTML = `<div style="margin-top:8px">Send to:</div>`;
    const list = document.createElement('div');
    friends.forEach(fr => {
      const b = document.createElement('button'); b.className='btn'; b.textContent = fr.name; b.style.margin='6px 6px 0 0';
      b.addEventListener('click', ()=> {
        // add image message (as data URL) to chats[fr.name]
        if(!chats[fr.name]) chats[fr.name] = [];
        chats[fr.name].push({ from:'me', text:'[image]', img: r.result, ts: Date.now() });
        saveState(); imageModal.style.display='none'; renderFriends();
      });
      list.appendChild(b);
    });
    imagePreviewWrap.appendChild(choose); imagePreviewWrap.appendChild(list);
  };
  r.readAsDataURL(f);
});

/* add friend by name */
function addFriendByName(name, avatar){
  if(!name) return;
  if(friends.some(f=>f.name === name)) return alert('Friend already added');
  friends.unshift({name, avatar: avatar || ''});
  if(!chats[name]) chats[name] = [];
  saveState(); renderFriends();
}

/* open chat UI (inline panel) */
function openChat(friendName){
  // ensure Chat tab active
  document.querySelector('.tabBtn[data-tab="chatTab"]').click();
  // remove any existing chatPanel for same friend
  const existing = document.getElementById('chatPanel_' + friendName);
  if(existing){ existing.remove(); return; }
  // create panel
  const panel = document.createElement('div'); panel.id = 'chatPanel_' + friendName; panel.className = 'chatPanel';
  const messagesDiv = document.createElement('div'); messagesDiv.className = 'messages';
  panel.appendChild(messagesDiv);
  const inputRow = document.createElement('div'); inputRow.className = 'chatInput';
  const input = document.createElement('input'); input.placeholder = 'Type a message';
  const sendBtn = document.createElement('button'); sendBtn.textContent = 'Send';
  inputRow.appendChild(input); inputRow.appendChild(sendBtn);
  panel.appendChild(inputRow);
  // include attach image
  const attach = document.createElement('input'); attach.type = 'file'; attach.accept='image/*';
  attach.style.marginTop = '6px';
  panel.appendChild(attach);

  // populate existing
  (chats[friendName] || []).forEach(m=>{
    const b = document.createElement('div'); b.className = 'bubble ' + (m.from === 'me' ? 'user' : 'friend');
    if(m.img) { const im = document.createElement('img'); im.src = m.img; im.style.maxWidth='70%'; im.style.borderRadius='8px'; b.appendChild(im); if(m.text) b.appendChild(document.createTextNode(' ' + m.text)); }
    else b.textContent = m.text;
    messagesDiv.appendChild(b);
  });

  sendBtn.addEventListener('click', ()=>{
    const text = input.value.trim(); if(!text) return;
    if(!chats[friendName]) chats[friendName] = [];
    chats[friendName].push({ from:'me', text, ts: Date.now() });
    saveState();
    const b = document.createElement('div'); b.className='bubble user'; b.textContent = text; messagesDiv.appendChild(b);
    input.value=''; messagesDiv.scrollTop = messagesDiv.scrollHeight;
    // simulated reply
    setTimeout(()=> {
      const reply = { from: friendName, text: 'Reply: ' + text, ts: Date.now() };
      chats[friendName].push(reply); saveState();
      const rb = document.createElement('div'); rb.className='bubble friend'; rb.textContent = reply.text; messagesDiv.appendChild(rb);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 700 + Math.random()*800);
  });

  attach.addEventListener('change', (e)=> {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=> {
      if(!chats[friendName]) chats[friendName] = [];
      chats[friendName].push({ from:'me', text: '[image]', img: r.result, ts:Date.now() });
      saveState();
      const b = document.createElement('div'); b.className='bubble user';
      const im = document.createElement('img'); im.src = r.result; im.style.maxWidth='70%'; im.style.borderRadius='8px';
      b.appendChild(im); messagesDiv.appendChild(b); messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };
    r.readAsDataURL(f);
  });

  // attach panel at top of friendsContainer
  friendsContainer.prepend(panel);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* calls */
function makeCall(name){
  calls.push({ name, ts: Date.now(), type: 'outgoing' });
  saveState(); renderCalls();
  alert('Simulated call to ' + name);
}
function simulateCall(name){ alert('Simulated calling ' + name); }

/* groups */
createGroupBtn.addEventListener('click', ()=>{
  const name = newGroupName.value.trim(); if(!name) return alert('Enter group name');
  const id = 'g_' + Date.now();
  groups[id] = { id, name, members: [], chats: [] };
  saveState(); newGroupName.value=''; renderGroups();
});
function openGroupChat(groupId){
  const g = groups[groupId]; if(!g) return;
  // modal build
  const modal = document.createElement('div'); modal.className='modal'; modal.style.display='flex';
  const content = document.createElement('div'); content.className='modalContent';
  content.innerHTML = `<div class="row" style="justify-content:space-between"><strong>${esc(g.name)}</strong><button id="closeGroup" class="btn">Close</button></div><div id="membersList" style="margin-top:8px"></div><input id="addMemberInput" placeholder="Add friend by name" class="input" style="margin-top:8px"/><div id="groupChatArea" style="margin-top:10px"></div>`;
  modal.appendChild(content); document.body.appendChild(modal);
  content.querySelector('#closeGroup').addEventListener('click', ()=> modal.remove());
  const membersList = content.querySelector('#membersList');
  function refreshMembers(){
    membersList.innerHTML = '';
    g.members.forEach(m=>{
      const d = document.createElement('div'); d.className='groupFriend'; d.innerHTML = `<div>${esc(m)}</div><div><button data-remove="${esc(m)}">Remove</button></div>`;
      membersList.appendChild(d);
      d.querySelector('button[data-remove]').addEventListener('click', ()=> { g.members = g.members.filter(x=>x!==m); saveState(); refreshMembers(); });
    });
    if(g.members.length===0) membersList.innerHTML = '<div class="small">No members yet</div>';
  }
  refreshMembers();
  content.querySelector('#addMemberInput').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      const n = e.target.value.trim(); if(!n) return;
      if(!friends.some(f=>f.name === n)) return alert('Friend not found — add them first');
      if(!g.members.includes(n)) g.members.push(n);
      e.target.value=''; saveState(); refreshMembers();
    }
  });
  // group chat
  const chatArea = content.querySelector('#groupChatArea'); const messagesDiv = document.createElement('div'); messagesDiv.className='messages'; chatArea.appendChild(messagesDiv);
  const inputRow = document.createElement('div'); inputRow.className='chatInput'; inputRow.innerHTML = '<input placeholder="Message to group"><button>Send</button>';
  chatArea.appendChild(inputRow);
  function refreshGroupMessages(){ messagesDiv.innerHTML=''; (g.chats||[]).forEach(m=>{ const b=document.createElement('div'); b.className='bubble '+(m.from==='me'?'user':'friend'); b.textContent = `${m.from}: ${m.text}`; messagesDiv.appendChild(b); }); messagesDiv.scrollTop = messagesDiv.scrollHeight; }
  refreshGroupMessages();
  inputRow.querySelector('button').addEventListener('click', ()=>{
    const txt = inputRow.querySelector('input').value.trim(); if(!txt) return;
    if(!g.chats) g.chats=[];
    g.chats.push({ from:'me', text: txt, ts: Date.now() }); saveState(); refreshGroupMessages(); inputRow.querySelector('input').value='';
    setTimeout(()=>{ if(g.members.length){ const who = g.members[Math.floor(Math.random()*g.members.length)]; g.chats.push({ from:who, text:'reply: '+txt, ts: Date.now() }); saveState(); refreshGroupMessages(); } }, 700 + Math.random()*900);
  });
}

/* Scanner logic (html5-qrcode), 'mode' used to decide behavior */
let scannerMode = null;
function openScanner(mode='top'){
  scannerMode = mode;
  scannerModal.style.display = 'flex';
  if(html5QrCode) return;
  html5QrCode = new Html5Qrcode("reader", false);
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  html5QrCode.start({ facingMode: "environment" }, config,
    decodedText => {
      try { decodedText = decodeURIComponent(decodedText); } catch(e){}
      decodedText = decodedText.trim();
      if(!decodedText) return;
      if(!friends.some(f=>f.name === decodedText)){
        friends.unshift({ name: decodedText, avatar: ''});
        if(!chats[decodedText]) chats[decodedText] = [];
        saveState(); renderFriends();
        if(scannerMode === 'top') { setTimeout(()=> openChat(decodedText), 300); }
      }
    },
    errorMessage => {}
  ).catch(err => { console.error(err); alert('Cannot start camera. Use HTTPS or localhost.'); closeScanner(); });
}
function closeScanner(){
  scannerModal.style.display = 'none';
  scannerMode = null;
  if(html5QrCode){
    html5QrCode.stop().then(()=> html5QrCode.clear()).catch(()=>{}).finally(()=> html5QrCode = null);
  }
}

/* events wiring */
$('closeSearch').addEventListener('click', ()=> searchModal.style.display = 'none');
$('closeImageModal').addEventListener('click', ()=> imageModal.style.display='none');
$('clearCalls').addEventListener('click', ()=> { calls=[]; saveState(); renderCalls(); });

topCamera.addEventListener('click', ()=> openScanner('top'));

/* search results on input */
searchInput.addEventListener('input', ()=>{
  const q = (searchInput.value||'').trim().toLowerCase();
  searchResults.innerHTML = '';
  const matched = friends.filter(f => f.name.toLowerCase().includes(q));
  matched.forEach(m => {
    const d = document.createElement('div'); d.className='friendCard'; d.innerHTML = `<div>${esc(m.name)}</div><div><button data-open="${esc(m.name)}">Open</button></div>`;
    searchResults.appendChild(d);
    d.querySelector('button[data-open]').addEventListener('click', ()=> { searchModal.style.display='none'; openChat(m.name);});
  });
  if(q && !friends.some(f => f.name.toLowerCase() === q)){
    const addBtnWrap = document.createElement('div'); addBtnWrap.style.marginTop='8px';
    addBtnWrap.innerHTML = `<button class="btn primary" id="addNewFriendBtn">Add "${esc(q)}"</button>`;
    searchResults.appendChild(addBtnWrap);
    addBtnWrap.querySelector('#addNewFriendBtn').addEventListener('click', ()=> { addFriendByName(q); searchModal.style.display='none'; });
  }
});

/* image send: open modal */
function openImageModal(){ imageModal.style.display='flex'; imagePreviewWrap.innerHTML = ''; sendImageFile.value = ''; }
sendImageFile.addEventListener('change', (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ()=> {
    imagePreviewWrap.innerHTML = `<img src="${r.result}" style="max-width:100%;border-radius:8px" />`;
    // list friends to send
    const list = document.createElement('div'); list.style.marginTop='8px';
    friends.forEach(fr => {
      const b = document.createElement('button'); b.className='btn'; b.textContent = fr.name; b.style.margin='6px 6px 0 0';
      b.addEventListener('click', ()=> {
        if(!chats[fr.name]) chats[fr.name] = [];
        chats[fr.name].push({ from:'me', text:'[image]', img: r.result, ts: Date.now() });
        saveState(); imageModal.style.display='none'; renderFriends();
      });
      list.appendChild(b);
    });
    imagePreviewWrap.appendChild(list);
  };
  r.readAsDataURL(f);
});

/* add friend helper exposed */
function addFriendByName(name){ if(!name) return; if(friends.some(f=>f.name === name)) { alert('Already added'); return; } friends.unshift({ name, avatar: ''}); if(!chats[name]) chats[name] = []; saveState(); renderFriends(); }
window.addFriendByName = addFriendByName;

/* open chat exported for dynamic buttons */
window.openChat = openChat;
window.simulateCall = simulateCall;

/* initial render */
if(profile) { applyProfile(); renderFriends(); renderGroups(); renderCalls(); }
