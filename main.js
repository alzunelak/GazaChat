document.addEventListener("DOMContentLoaded", () => {
    const screen1 = document.getElementById("screen1");
    const screen2 = document.getElementById("screen2");
    const screen3 = document.getElementById("screen3");
    const screen4 = document.getElementById("screen4");

    const continueBtn = document.getElementById("continueBtn");
    const setNameBtn = document.getElementById("setNameBtn");
    const startChatBtn = document.getElementById("startChatBtn");
    const sendBtn = document.getElementById("send-btn");

    const usernameInput = document.getElementById("usernameInput");
    const friendNameInput = document.getElementById("friendNameInput");
    const messageInput = document.getElementById("message-input");
    const chatBox = document.getElementById("chat-box");

    let username = "";
    let friendName = "";

    // Step 1: Continue from Logo
    continueBtn.addEventListener("click", () => {
        screen1.classList.add("hidden");
        screen2.classList.remove("hidden");
    });

    // Step 2: Set username
    setNameBtn.addEventListener("click", () => {
        if (usernameInput.value.trim() === "") {
            alert("Please enter your name.");
            return;
        }
        username = usernameInput.value.trim();
        screen2.classList.add("hidden");
        screen3.classList.remove("hidden");

        // Generate QR code for username
        const qrCodeDiv = document.getElementById("qrcode");
        qrCodeDiv.innerHTML = "";
        new QRCode(qrCodeDiv, username);
    });

    // Step 3: Find friend and start chat
    startChatBtn.addEventListener("click", () => {
        if (friendNameInput.value.trim() === "") {
            alert("Please enter your friend's username or scan their QR.");
            return;
        }
        friendName = friendNameInput.value.trim();
        screen3.classList.add("hidden");
        screen4.classList.remove("hidden");
    });

    // Step 4: Send messages (local demo only)
    sendBtn.addEventListener("click", () => {
        const message = messageInput.value.trim();
        if (message === "") return;

        const msgElement = document.createElement("div");
        msgElement.textContent = `${username}: ${message}`;
        chatBox.appendChild(msgElement);
        messageInput.value = "";
    });
});
