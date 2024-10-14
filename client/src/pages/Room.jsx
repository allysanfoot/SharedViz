import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid'

// Import components
import { sckt } from '../components/Socket';
import Video from '../components/Video'
import { store } from 'react-notifications-component';

// Import utils
import { getVideoType } from '../utils/video';

// Import styles
import '../styles/room.css';

export const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const [currUser, setCurrUser] = useState({
        id: '',
        name: JSON.parse(localStorage.getItem('name')) || '',
        colors: JSON.parse(localStorage.getItem('colors')) || { primary: '#FF0000', secondary: '#0000FF' }
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

    // Set the current user's colors
    useEffect(() => {
        localStorage.setItem('colors', JSON.stringify(currUser.colors));
    }, [currUser.colors])

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

    const loadVideo = (videoObject, sync) => {
        const { playing, seekTime, initVideo } = videoProps;

        if (!videoObject || (playerRef.current === null && initVideo)) return; // Early return if conditions are not met

        const updates = {
            url: videoObject.video.url,
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

    // Maybe move this to a separate file
    const insert = (arr, index, newItem) => [
        ...arr.slice(0, index),
        newItem,
        ...arr.slice(index)
    ];

    // Get the video from the search results
    const getVideoFromSearch = (videoObject) => {
        let url = videoObject.video.url;
        let videoType = getVideoType(url);
        if (!videoType) {
            store.addNotification({
                title: "Invalid URL",
                message: "Please enter a valid YouTube URL.",
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
            return;
        }

        let { queue } = videoProps;
        // Insert the video at the end of the queue
        let updatedQueue = insert(queue, queue.length, videoObject)
        // Send the updated queue to all clients
        sendVideoState({
            eventName: "syncQueue",
            eventParams: {
                queue: updatedQueue,
                type: "add"
            }
        });
        updateVideoProps({ queue: updatedQueue });
    }

    const playSearchedVideo = (videoItem) => {
        const url = videoItem.video.url;
        const videoType = getVideoType(url);
        if (videoType !== null) {
            updateVideoProps({ videoType });
        }
        // Handle playing video immediately
        const { history } = videoProps;
        loadVideo(videoItem, false);
        sendVideoState({
            eventName: "syncLoad",
            eventParams: { videoItem, history: [videoItem, ...history] }
        });
        updateVideoProps({ history: [videoItem, ...history] });
    }

    const logMessage = (msg, type) => {
        let baseStyles = [
            "color: #fff",
            "background-color: #444",
            "padding: 2px 4px",
            "border-radius: 2px"
        ].join(';');
        let serverStyles = [
            "background-color: gray"
        ].join(';');
        let otherStyles = [
            "color: #eee",
            "background-color: red"
        ].join(';');
        let meStyles = [
            "background-color: green"
        ].join(';');
        // Set style based on input type
        let style = baseStyles + ';';
        switch (type) {
            case "server": style += serverStyles; break;
            case "other": style += otherStyles; break;
            case "me": style += meStyles; break;
            case "none": style = ''; break;
            default: break;
        }
        console.log(`%c${msg}`, style);
    }

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
        <div className="room-wrapper">
            <h1>Room Page: {roomId}</h1>
            <button onClick={() => navigate('/')}>Go to Home</button>
            <Video
                logMessage={logMessage}
                currUser={currUser}
                room={room}
                videoProps={videoProps}
                updateVideoProps={updateVideoProps}
                playerRef={playerRef}
                sendVideoState={sendVideoState}
                loadVideo={loadVideo}
                playSearchedVideo={playSearchedVideo}
                getVideoFromSearch={getVideoFromSearch}
            />
        </div>
    )
}
