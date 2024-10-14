// Import socket.io-client
import { io } from 'socket.io-client';

// Get the server endpoint from environment variables
// Or manually set the endpoint to the server
const ENDPOINT = 'localhost:31415'

export const sckt = {
    socket: io(ENDPOINT), // Connect to the server
};
