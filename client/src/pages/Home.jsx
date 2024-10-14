import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sckt } from '../components/Socket'; // Import the socket instance
import { nanoid } from 'nanoid';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            sckt.socket.off('error');
            sckt.socket.off('userJoined');
        };
    }, []);    

    // Handle creating a new room
    const handleCreateRoom = () => {
        const newRoomId = nanoid(10); // Generate a new random room ID
        sckt.socket.emit('createRoom', newRoomId); // Emit event to create room on the server
        navigate(`/room/${newRoomId}`); // Redirect to the newly created room
    };

    // Handle joining an existing room
    const handleJoinRoom = () => {
        if (roomId) {
            console.log(`Joining room: ${roomId}`);
            sckt.socket.emit('joinRoom', { roomId: roomId, userId: sckt.socket.id });

            // Listen for error from server
            sckt.socket.on('error', (message) => {
                setError(message); // Display error message to the user
            });

            // Listen for userJoined event from server
            sckt.socket.on('userJoined', () => {
                navigate(`/room/${roomId}`); // Redirect to the room if joined successfully
            });
        } else {
            setError('Please enter a valid room ID.');
        }
    };

    return (
        <div className="home-container">
            <h1>Welcome to SharedViz</h1>
            <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoinRoom}>Join Room</button>
            {error && <p className="error">{error}</p>}
            <button onClick={handleCreateRoom}>Create New Room</button>
        </div>
    );
};

export default Home;
