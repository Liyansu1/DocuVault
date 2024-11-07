// server.js


import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const PORT=process.env.SOCKET_SERVER_PORT; //socket_port
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());


app.get('/', (req, res) => {
  res.send('Running');
});

io.on("connection", (socket) => {

  socket.on("join", (userId) => {
    

    
    socket.join(userId);
    io.to(userId).emit("me", userId);
   
   
   // console.log(`User ${socket.id} join room `,userId);
   
   
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
   // console.log(`User ${socket.id} left room ${room}`);
  });

  socket.on("disconnect", () => {
   // console.log("disconnect",socket.id);

    socket.broadcast.emit("callEnded");
  });


  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", { signal: data.signal, name: data.name });
  });

  socket.on("callRejected", ({ to }) => {
    // Notify the caller about the rejection
    io.to(to).emit("callRejected");
  });
});

server.listen(PORT, () => console.log(`socket Server is running on port ${PORT}`));
