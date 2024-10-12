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
        origin: "*", // Allow requests from the React client
        methods: ["GET", "POST"]
    }
});

require('dotenv').config()

const rooms = new Map(); // Map to store rooms and users

// Function to return all active rooms
function getActiveRooms() {
    return Array.from(rooms.keys());
}

io.on('connection', (socket) => {
    try {
        console.log('A user connected:', socket.id);

        // Join an existing room or create a new room if it doesn't exist
        socket.on('joinRoom', ({ roomId, userId }) => {
            // Check if the room exists
            if (rooms.has(roomId)) {
                // Join the room
                socket.join(roomId);
                console.log(`User ${userId} joined room ${roomId}`);

                // Notify the user and others in the room
                socket.to(roomId).emit('userJoined', { userId, roomId });
                socket.emit('userJoined', { userId, roomId }); // Emit the event to the user joining
            } else {
                // If the room doesn't exist, emit an error event
                socket.emit('error', 'Room does not exist');
            }
        });

        // Create a new room
        socket.on('createRoom', (roomId) => {
            if (!rooms.has(roomId)) {
                rooms.set(roomId, []); // Create the room if it doesn't exist
                console.log(`Room ${roomId} created`);
            }
            // Automatically add the creator to the room
            socket.join(roomId);
            io.to(roomId).emit('roomCreated', { roomId });
        });

        // Handle play/pause event
        socket.on('playPause', ({ roomName, playing }) => {
            const roomState = rooms.get(roomName);
            if (roomState) {
                roomState.playing = playing;
                io.to(roomName).emit('playPause', playing); // Broadcast to all users in the room
            }
        });

        // Handle sync event
        // When a client sends a sync event, the server forwards the event to the client with the specified ID
        socket.on('sendSync', ({ id, ...videoProps }, callback) => {
            socket.to(id).emit('startSync', videoProps);
        });

        // On user disconnect
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });

    } catch (error) {
        console.error("An error occurred:", error);
    }
});


app.use(router);
app.use(cors({
    origin: "http://localhost:3000", // Allow this origin
    methods: ["GET", "POST"],
    credentials: true
}));

server.listen(port, () => console.log(`Server has started on port ${port}`));