// Import socket.io-client
import { io } from 'socket.io-client';

// Get the server endpoint from environment variables
const ENDPOINT = process.env.REACT_APP_SERVER;

// Create a Socket class
class Socket {
    constructor() {
        this.socket = io(ENDPOINT); // Initialize the socket connection
    }
}

// Create a socket instance
const sckt = new Socket();

export { sckt };
