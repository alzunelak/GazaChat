let username = "";
let friendName = "";

const socket = io("https://chatapp-backend.onrender.com");


// Screen navigation
document.getElementById("continueBtn").addEventListener("click", () => {
  showScreen(2);
});

document.getElementById("setNameBtn").addEventListener("click", () => {
  const name = document.getElementById("usernameInput").value.trim();
  if (name) {
    username = name;
    generateQRCode(username);
    startScanner();
    showScreen(3);
  }
});

document.getElementById("startChatBtn").addEventListener("click", () => {
  const friend = document.getElementById("friendNameInput").value.trim();
  if (friend) {
    friendName = friend;
    showScreen(4);
  }
});

// Sending message
document.getElementById("send-btn").addEventListener("click", () => {
  const msg = document.getElementById("message-input").value;
  if (msg.trim()) {
    socket.emit("chat message", `${username} → ${friendName}: ${msg}`);
    document.getElementById("message-input").value = "";
  }
});

// Receiving message
socket.on("chat message", (msg) => {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.textContent = msg;
  chatBox.appendChild(div);
});

// Show specific screen
function showScreen(num) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(`screen${num}`).classList.remove("hidden");
}

// Generate QR code for your username
function generateQRCode(name) {
  document.getElementById("qrcode").innerHTML = "";
  new QRCode(document.getElementById("qrcode"), {
    text: name,
    width: 128,
    height: 128
  });
}

// Start QR code scanner
function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      document.getElementById("friendNameInput").value = decodedText;
      html5QrCode.stop();
    },
    (error) => {
      // ignore scan errors
    }
  ).catch(err => console.error(err));
}
