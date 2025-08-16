const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Allow frontend connection for now
});

// Store connected users { username: socket.id }
let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User registers their name when they join
  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log(`${username} registered with ID ${socket.id}`);
  });

  // ✅ One-to-one messaging
  socket.on("private message", ({ sender, recipient, message }) => {
    const targetId = users[recipient];
    if (targetId) {
      io.to(targetId).emit("private message", { sender, message });
      io.to(users[sender]).emit("private message", { sender, message }); // echo back to sender
    }
  });

  // ✅ Group messaging
  socket.on("join group", (groupName) => {
    socket.join(groupName);
    console.log(`${socket.id} joined group: ${groupName}`);
  });

  socket.on("group message", ({ sender, groupName, message }) => {
    io.to(groupName).emit("group message", { sender, message });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // allow all origins for testing
});

// Store connected users: { username: socket.id }
let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Save username when client joins
  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log("Users:", users);
  });

  // Send call request to friend
  socket.on("call-user", ({ to, from, type }) => {
    if (users[to]) {
      io.to(users[to]).emit("incoming-call", { from, type });
    }
  });

  // Notify that call is accepted
  socket.on("accept-call", ({ to }) => {
    if (users[to]) {
      io.to(users[to]).emit("call-accepted");
    }
  });

  // Notify that call is ended
  socket.on("end-call", ({ to }) => {
    if (users[to]) {
      io.to(users[to]).emit("call-ended");
    }
  });

  socket.on("disconnect", () => {
    // Remove user from list
    for (let name in users) {
      if (users[name] === socket.id) delete users[name];
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
