import { Socket } from "socket.io";
import http from "http";
import fs from 'node:fs';
import express from 'express';
import { Server } from 'socket.io';
import Users  from "./Users";
import https from 'node:https'

// curl -k https://localhost:8000/


// const key = fs.readFileSync('cert.key');
// const cert = fs.readFileSync('cert.crt');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const User = new Users();

app.get('/hello',(req,res)=>{
    res.send('hello world');
    
})



io.on('connection', (socket: Socket) => {
  socket.on('name',({name,city,width,height})=>{
    console.log(name,city)
    User.createUser( socket,name,city,width,height);
  });
  socket.on("disconnect", () => {
   // console.log(room);
    console.log("user disconnected");
   User.removeUser(socket.id);
  })
});
// 172.20.10.2
// 192.168.1.104
server.listen(3000,() => {
    console.log('listening on *:3000');
});