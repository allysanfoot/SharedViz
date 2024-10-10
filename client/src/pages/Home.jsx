import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate(); // Use the useNavigate hook instead of history

    const createRoom = () => {
        const roomId = 'some-generated-room-id'; // Example room ID
        navigate(`/room/${roomId}`); // Navigate to the new route
    };

    return (
        <div>
            <h1>Home</h1>
            <button onClick={createRoom}>Create Room</button>
        </div>
    );
}

export default Home;
