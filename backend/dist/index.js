"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const Users_1 = __importDefault(require("./Users"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(http_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
const User = new Users_1.default();
io.on('connection', (socket) => {
    socket.on('name', ({ name, city }) => {
        console.log(name, city);
        User.createUser(socket, name, city);
    });
    socket.on("disconnect", () => {
        // console.log(room);
        console.log("user disconnected");
        User.removeUser(socket.id);
    });
});
// 172.20.10.2
// 192.168.1.104
server.listen(3000, '192.168.1.110', () => {
    console.log('listening on *:3000');
});
