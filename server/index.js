const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 31415;
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000", // Allow requests from the React client
        methods: ["GET", "POST"]
    }
});


require('dotenv').config()

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.emit('message', 'Hello from the server!');
    
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });

    socket.on('customEvent', (data) => {
        console.log('Custom event received:', data);
    });
});

app.use(router);
app.use(cors({
    origin: "http://localhost:3000", // Allow this origin
    methods: ["GET", "POST"]
}));

server.listen(port, () => console.log(`Server has started on port ${port}`));