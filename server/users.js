// Use a Map for efficient user storage and access
const rooms = new Map(); // { roomName: Map({ userId: { id, name, room } }) }

const checkUser = ({ name, room }) => {
    // Check if the room exists
    if (rooms.has(room)) {
        const usersInRoom = rooms.get(room);
        // Check if a user with the same name exists in the room
        const duplicateUser = Array.from(usersInRoom.values()).find(user => user.name === name);
        if (duplicateUser) return { error: 'DUPLICATE_USER' };
    }
    return {};
};

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Add user to the specified room
    if (!rooms.has(room)) {
        rooms.set(room, new Map()); // Create a new room if it doesn't exist
    }

    const usersInRoom = rooms.get(room);
    const user = { id, name, room };
    usersInRoom.set(id, user);

    return { user };
};

const removeUser = (id) => {
    for (const [room, usersInRoom] of rooms.entries()) {
        if (usersInRoom.has(id)) {
            const removedUser = usersInRoom.get(id);
            usersInRoom.delete(id); // Remove the user
            if (usersInRoom.size === 0) {
                rooms.delete(room); // If no users remain in the room, delete the room
            }
            return removedUser;
        }
    }
};

const getUserById = (id) => {
    for (const usersInRoom of rooms.values()) {
        if (usersInRoom.has(id)) {
            return usersInRoom.get(id);
        }
    }
};

const getUserByName = (name, room) => {
    room = room.trim().toLowerCase();
    if (rooms.has(room)) {
        const usersInRoom = rooms.get(room);
        return Array.from(usersInRoom.values()).find(user => user.name === name);
    }
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    if (rooms.has(room)) {
        return Array.from(rooms.get(room).values());
    }
    return [];
};

const getOtherUserInRoom = (room, newUser) => {
    room = room.trim().toLowerCase();
    if (rooms.has(room)) {
        const usersInRoom = rooms.get(room);
        return Array.from(usersInRoom.values()).find(user => user.id !== newUser.id);
    }
};

export default {
    checkUser,
    addUser,
    removeUser,
    getUserById,
    getUserByName,
    getUsersInRoom,
    getOtherUserInRoom
};
