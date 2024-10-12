import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

// Import components
import { sckt } from '../components/Socket';
import Video from '../components/Video'
import { store } from 'react-notifications-component';

import { nanoid } from 'nanoid'

export const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const [currUser, setCurrUser] = useState({
        id: '',
        name: JSON.parse(localStorage.getItem('name')) || '',
    });
    const [room, setRoom] = useState('');
    const [videoProps, setVideoProps] = useState({
        queue: [],
        history: [],
        playing: true,
        seekTime: 0,
        receiving: false,
        initVideo: false,
        videoType: 'youtube'
    });
    const [users, setUsers] = useState([]);
    const [isJoined, setIsJoined] = useState(false);

    // Set the current user's ID
    useEffect(() => {
        localStorage.setItem('name', JSON.stringify(currUser.name));
    }, [currUser.name]);


    // Join the room
    useEffect(() => {
        const handler = ({ users }) => setUsers(users);
        sckt.socket.on("roomData", handler);
        return () => sckt.socket.off('roomData', handler);
    }, []);

    // Update the current user
    const updateCurrUser = (paramsToChange) => {
        setCurrUser((prev) => ({ ...prev, ...paramsToChange }));
    };

    // Update the video properties
    const updateVideoProps = (paramsToChange) => {
        setVideoProps((prev) => ({ ...prev, ...paramsToChange }));
    };

    // Load a video from the queue
    const sendVideoState = ({ eventName, eventParams }) => {
        let params = {
            name: currUser.name,
            room: room,
            eventName: eventName,
            eventParams: eventParams
        };
        sckt.socket.emit('sendVideoState', params);
    };

    const loadVideo = (searchItem, sync) => {
        const { playing, seekTime, initVideo } = videoProps;
    
        if (!searchItem || (playerRef.current === null && initVideo)) return; // Early return if conditions are not met
    
        const updates = {
            url: searchItem.video.url,
            receiving: false,
            playing: sync ? playing : true,
        };
    
        // If the video hasn't been initialized yet, set initVideo to true
        if (!initVideo) {
            updates.initVideo = true;
        }
    
        updateVideoProps(updates);
    
        // If synchronization is needed, seek to the specified time
        if (sync && playerRef.current) {
            playerRef.current.seekTo(seekTime, 'seconds');
        }    
    };
    

    useEffect(() => {
        const room = roomId;
        if (room) {
            sckt.socket.emit('checkRoomExists', { room }, (exists) => {
                if (exists) {
                    setRoom(room);
                    let name = currUser.name;
                    if (!name) { // If no name in localStorage
                        name = `User-${nanoid(8)}`; // Generate a unique name with a prefix
                        updateCurrUser({ name });
                    }
                    // Join the room
                    sckt.socket.emit('join', { name, room }, ({ id }) => {
                        updateCurrUser({ id });
                        setTimeout(() => {
                            setIsJoined(true);
                        }, 750);
                    });
                } else {
                    // Instead of history.push, show an error message and a button to go back
                    store.addNotification({
                        title: "Oops!",
                        message: `The room "${room}" doesn't exist. Please create a new room!`,
                        type: "danger",
                        insert: "top",
                        container: "bottom-right",
                        animationIn: ["animated", "fadeInUp"],
                        animationOut: ["animated", "fadeOut"],
                        dismiss: {
                            duration: 5000,
                            onScreen: false
                        }
                    });
                    // Navigate back to the homepage after a delay
                    setTimeout(() => navigate('/'), 5000);
                }
            });
        }
    }, [room, currUser, navigate]);

    return (
        <div>
            <h1>Room Page</h1>
            <Video />
        </div>
    )
}
