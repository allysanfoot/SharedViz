import React from 'react'
import { io } from 'socket.io-client'
import { useEffect, useState } from 'react'

const TestSocket = () => {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Create a new Socket.IO connection
        const newSocket = io('http://localhost:31415'); // Make sure the URL matches your server
        setSocket(newSocket);

        // Listen for connection
        newSocket.on('connect', () => {
            console.log('Connected to the server');
        });

        // Listen for messages from the server
        newSocket.on('message', (data) => {
            console.log('Message from server:', data);
            setMessage(data);
        });

        // Listen for disconnection
        newSocket.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        // Clean up the connection when the component is unmounted
        return () => {
            newSocket.disconnect();
        };
    }, []); // Empty dependency array ensures this effect runs once

    const sendMessageToServer = () => {
        if (socket) {
            socket.emit('customEvent', { message: 'Hello from the client!' });
            console.log('Message sent to server');
        }
    };

    return (
        <div>
            <h1>Socket.IO Connection Test</h1>
            <p>Message from server: {message}</p>
            <button onClick={sendMessageToServer}>Send Message to Server</button>
        </div>
    );

};

export default TestSocket