import { io } from "socket.io-client";

const socket = io(process.env.VITE_URL, {
  transports: ["websocket"],
});

// auto join user room
socket.on("connect", () => {
  const userId = localStorage.getItem("userId");

  if (userId) {
    console.log("✅ Joining user room:", userId);
    socket.emit("joinUserRoom", userId);
  } else {
    console.log("❌ userId missing");
  }
});

export default socket;