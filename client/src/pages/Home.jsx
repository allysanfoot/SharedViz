import React from 'react'
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid'

const Home = ({ location, history }) => {
    const navigate = useNavigate();

    // Create a new room
    const createRoom = () => {
        const roomId = nanoid(10);
        navigate(`/room/${roomId}`); // Navigate to the new room
        console.log('Creating room:', roomId);
    }

    return (
        <div>
            <h1>Home Page</h1>
            <p>Click the button below to create a new room.</p>
            <button onClick={createRoom}>Create Room</button>
        </div>
    )
}

export default Home;
