import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes("localhost") || origin.includes("vercel.app") || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST"],
    credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- WebRTC Signaling for Calls ---
  
  socket.on("callUser", async ({ userToCall, signalData, from, name }) => {
    try {
      const caller = await User.findById(from);
      const receiver = await User.findById(userToCall);
      
      if (caller?.blockedUsers?.some(id => id.toString() === userToCall.toString()) || 
          receiver?.blockedUsers?.some(id => id.toString() === from.toString())) {
          return socket.emit("callRejected", { reason: "User unavailable" });
      }

      const receiverSocketId = getReceiverSocketId(userToCall);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callUser", { signal: signalData, from, name });
      } else {
        // Receiver is offline — notify caller immediately
        socket.emit("callRejected", { reason: "User is offline" });
      }
    } catch(err) {
      console.error("Error in callUser:", err);
      socket.emit("callRejected", { reason: "Something went wrong" });
    }
  });

  socket.on("answerCall", (data) => {
    const callerSocketId = getReceiverSocketId(data.to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", data.signal);
    }
  });

  socket.on("endCall", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded");
    }
  });

  // --- Status Broadcast ---
  socket.on("newStatus", (statusData) => {
    // broadcast to all other users that a new status is available
    socket.broadcast.emit("newStatusUpdate", statusData);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
