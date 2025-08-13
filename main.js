const socket = io("http://localhost:3000");

document.getElementById("send-btn").addEventListener("click", () => {
  const msg = document.getElementById("message-input").value;
  socket.emit("chat message", msg);
  document.getElementById("message-input").value = "";
});

socket.on("chat message", (msg) => {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.textContent = msg;
  chatBox.appendChild(div);
});
