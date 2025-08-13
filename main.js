document.addEventListener("DOMContentLoaded", () => {
    const screen1 = document.getElementById("screen1");
    const screen2 = document.getElementById("screen2");
    const screen3 = document.getElementById("screen3");
    const screen4 = document.getElementById("screen4");

    const setNameBtn = document.getElementById("setNameBtn");
    const addFriendBtn = document.getElementById("addFriendBtn");
    const scanQRBtn = document.getElementById("scanQRBtn");
    const startChatBtn = document.getElementById("startChatBtn");
    const sendBtn = document.getElementById("send-btn");

    const usernameInput = document.getElementById("usernameInput");
    const yourNameField = document.getElementById("yourNameField");
    const friendNameInput = document.getElementById("friendNameInput");
    const chatBox = document.getElementById("chat-box");
    const messageInput = document.getElementById("message-input");

    let username = "";
    let friendName = "";

    // Splash screen
    setTimeout(() => {
        screen1.classList.add("fade-out");
        setTimeout(() => {
            screen1.classList.add("hidden");
            screen2.classList.remove("hidden");
        }, 1000);
    }, 3000);

    // Enter name
    setNameBtn.addEventListener("click", () => {
        if (usernameInput.value.trim() === "") return alert("Enter your name");
        username = usernameInput.value.trim();
        screen2.classList.add("fade-out");
        setTimeout(() => {
            screen2.classList.add("hidden");
            screen3.classList.remove("hidden");
            yourNameField.value = username;
            new QRCode(document.getElementById("qrcode"), username);
        }, 500);
    });

    // Show friend options
    addFriendBtn.addEventListener("click", () => {
        document.getElementById("friendOptions").classList.remove("hidden");
    });

    // QR Scanner
    const html5QrcodeScanner = new Html5Qrcode("reader");
    scanQRBtn.addEventListener("click", () => {
        document.getElementById("reader").style.display = "block";
        function onScanSuccess(decodedText) {
            friendNameInput.value = decodedText;
            friendName = decodedText;
            startChatBtn.classList.remove("hidden");
            html5QrcodeScanner.stop().then(() => {
                document.getElementById("reader").style.display = "none";
            });
        }
        Html5Qrcode.getCameras().then(cameras => {
            if (cameras && cameras.length) {
                html5QrcodeScanner.start(cameras[0].id, { fps:10, qrbox:250 }, onScanSuccess);
            }
        });
    });

    // Manual friend input
    friendNameInput.addEventListener("input", () => {
        startChatBtn.classList.toggle("hidden", friendNameInput.value.trim() === "");
    });

    // Start chat
    startChatBtn.addEventListener("click", () => {
        friendName = friendNameInput.value.trim();
        if (!friendName) return alert("Enter friend's username or scan QR");
        screen3.classList.add("fade-out");
        setTimeout(() => {
            screen3.classList.add("hidden");
            screen4.classList.remove("hidden");
        }, 500);
    });

    // Chat messages
    sendBtn.addEventListener("click", () => {
        const msg = messageInput.value.trim();
        if (!msg) return;
        const msgEl = document.createElement("div");
        msgEl.classList.add("message","me");
        msgEl.textContent = `${username}: ${msg}`;
        chatBox.appendChild(msgEl);
        chatBox.scrollTop = chatBox.scrollHeight;
        messageInput.value = "";
    });
});
