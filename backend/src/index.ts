import { Socket } from "socket.io";
import http from "http";

import express from 'express';
import { Server } from 'socket.io';
import Users  from "./Users";

const app = express();
const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const User = new Users();


io.on('connection', (socket: Socket) => {
  socket.on('name',({name,city})=>{
    console.log(name,city)
    User.createUser( socket,name,city);
  });
  socket.on("disconnect", () => {
   // console.log(room);
    console.log("user disconnected");
   User.removeUser(socket.id);
  })
});
// 172.20.10.2
// 192.168.1.104
server.listen(3000,'192.168.1.110',() => {
    console.log('listening on *:3000');
});