document.addEventListener("DOMContentLoaded", () => {
    const screen1 = document.getElementById("screen1");
    const screen2 = document.getElementById("screen2");
    const screen3 = document.getElementById("screen3");
    const screen4 = document.getElementById("screen4");

    const setNameBtn = document.getElementById("setNameBtn");
    const startChatBtn = document.getElementById("startChatBtn");
    const sendBtn = document.getElementById("send-btn");

    const usernameInput = document.getElementById("usernameInput");
    const friendNameInput = document.getElementById("friendNameInput");
    const messageInput = document.getElementById("message-input");
    const chatBox = document.getElementById("chat-box");

    let username = "";
    let friendName = "";

    // --- Splash Screen Auto Fade ---
    setTimeout(() => {
        screen1.classList.add("fade-out");
        setTimeout(() => {
            screen1.classList.add("hidden");
            screen2.classList.remove("hidden");
        }, 1000); // match CSS transition
    }, 3000);

    // --- Enter Your Name ---
    setNameBtn.addEventListener("click", () => {
        if (usernameInput.value.trim() === "") {
            alert("Please enter your name.");
            return;
        }
        username = usernameInput.value.trim();
        screen2.classList.add("fade-out");
        setTimeout(() => {
            screen2.classList.add("hidden");
            screen3.classList.remove("hidden");

            // Generate QR code
            const qrCodeDiv = document.getElementById("qrcode");
            qrCodeDiv.innerHTML = "";
            new QRCode(qrCodeDiv, username);

            // Optional: start QR code scanner here
        }, 500);
    });

    // --- Find Friend & Start Chat ---
    startChatBtn.addEventListener("click", () => {
        if (friendNameInput.value.trim() === "") {
            alert("Please enter your friend's username or scan their QR.");
            return;
        }
        friendName = friendNameInput.value.trim();
        screen3.classList.add("fade-out");
        setTimeout(() => {
            screen3.classList.add("hidden");
            screen4.classList.remove("hidden");
        }, 500);
    });

    // --- Send Messages ---
    sendBtn.addEventListener("click", () => {
        const message = messageInput.value.trim();
        if (message === "") return;

        const msgElement = document.createElement("div");
        msgElement.classList.add("message");
        msgElement.textContent = `${username}: ${message}`;
        chatBox.appendChild(msgElement);

        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        messageInput.value = "";
    });
});
