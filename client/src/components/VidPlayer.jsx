// VideoPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';

// Import components
import Controls from './Controls';

// Import styles
import '../styles/vidPlayer.css'

let count = 0;

const VideoPlayer = ({ videoProps, sendVideoState, updateVideoProps, playerRef, loadVideo, loadFromQueue }) => {
    const playerContainerRef = useRef(null);
    const controlsRef = useRef(null);
    const currentTime = (playerRef && playerRef.current) ? playerRef.current.getCurrentTime() : 0;
    const duration = (playerRef && playerRef.current) ? playerRef.current.getDuration() : 0;

    const [videoStarted, setVideoStarted] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [state, setState] = useState({
        duration: 0,
        isFullscreen: false,
        jumpedTime: 0,
        light: false,
        muted: false,
        pip: false,
        playbackRate: 1.0,
        played: 0,
        playing: false,
        seeking: false,
        volume: 1.0
    });

    // Get all this shit from state
    const {
        isFullscreen,
        jumpedTime,
        light,
        muted,
        playbackRate,
        pip,
        seeking,
        volume
    } = state;

    const {
        history,
        initVideo,
        playing,
        queue,
        receiving,
        seekTime,
        videoType
    } = videoProps;

    const videoUrl = history[0]?.video.url || '';

    // Handles playing and pausing
    const handlePlayPause = () => {
        const seekTime = playerRef.current.getCurrentTime();
        const nextState = !playing; // Toggle play/pause state

        updateVideoProps({
            playing: nextState,
            seekTime,
            receiving: false,
        });

        sendVideoState({
            eventName: nextState ? 'syncPlay' : 'syncPause',
            eventParams: { seekTime },
        });

        if (!nextState && videoEnded) playerRef.current.seekTo(0); // Reset if paused at end
    };

    // Handles rewinding
    // Users can press a key to rewind the video by 10 seconds
    const handleRewind = () => {
        // Retrieve current playback time from the video player
        const currentTime = playerRef.current.getCurrentTime();
        // Calculate the new time by subtracting 10 seconds from the current time
        const newTime = Math.max(currentTime - 10, 0); // Ensure newTime is not negative

        // Jump to the new time
        playerRef.current.seekTo(newTime);

        // Update the state
        // Set seeking to true to prevent the video from playing while seeking
        setState((prevState) => ({
            ...prevState,
            seeking: true,
            jumpedTime: newTime,
        }));

        // Send the new time to the server
        sendVideoState({
            eventName: 'syncPlay',
            eventParams: { seekTime: newTime },
        });
    };

    // Handles fast forwarding
    // Users can press a key to fast forward the video by 10 seconds
    const handleFastForward = () => {
        // Retrieve current playback time from the video player
        const currentTime = playerRef.current.getCurrentTime();
        // Calculate the new time by adding 10 seconds to the current time
        const newTime = Math.min(currentTime + 10, duration || currentTime); // Ensure newTime is not greater than the duration

        // Jump to the new time
        playerRef.current.seekTo(newTime);
        setState(prevState => ({
            ...prevState,
            seeking: true,
            jumpedTime: newTime
        }));

        // Send the new time to the server
        sendVideoState({
            eventName: 'syncPlay',
            eventParams: { seekTime: newTime }
        });
    };

    // Handles seeking
    const handleSeek = (newTimeArray) => {
        const [newTime] = newTimeArray; // Destructure to extract newTime

        // Ensure newTime is within valid bounds (0 to duration)
        const validTime = Math.max(0, Math.min(newTime, duration || newTime));

        // Update player and state
        playerRef.current?.seekTo(validTime, "seconds");
        setState(prevState => ({
            ...prevState,
            seeking: true,
            jumpedTime: validTime,
        }));

        // Sync the seek event with others
        sendVideoState({
            eventName: 'syncSeek',
            eventParams: { seekTime: validTime },
        });
    };

    // Handles volume change
    const handleVolumeChange = (newValueArray) => {
        const [newValue] = newValueArray; // Destructure to extract newValue

        // Clamp the value between 0 and 1
        const validVolume = Math.max(0, Math.min(newValue, 1));

        // Update the state
        setState(prevState => ({
            ...prevState,
            volume: parseFloat(validVolume),
            muted: validVolume === 0,
        }));
    };

    // Handles mute/unmute
    const handleMute = () => {
        setState({ ...state, muted: !muted });
    };

    // Handles fullscreen toggling
    const handleToggleFullscreen = () => {
        screenfull.toggle(playerContainerRef.current);
    }

    const showControls = () => {
        if (controlsRef.current && videoStarted) {
            controlsRef.current.style.opacity = 1;
            controlsRef.current.style.pointerEvents = "auto";
            controlsRef.current.style.cursor = "auto";
            playerContainerRef.current.style.cursor = "auto";
        }
    };

    const hideControls = () => {
        if (controlsRef.current) {
            controlsRef.current.style.opacity = 0;
            controlsRef.current.style.pointerEvents = "none";
            controlsRef.current.style.cursor = "none";
        }
        if (playerContainerRef.current) {
            playerContainerRef.current.style.cursor = "none";
        }
    };

    const handleMouseMovement = () => {
        showControls();
        count = 0;
    }

    const handleMouseLeave = () => {
        setTimeout(() => {
            hideControls();
            count = 0;
        }, 200);
    };

    const handlePlaybackRate = (rate) => {
        if (rate === 0) rate = 0.5;
        setState({ ...state, playbackRate: rate });
        updateVideoProps({ receiving: false });
        sendVideoState({
            eventName: 'syncRateChange',
            eventParams: { playbackRate: rate }
        });
    };

    const handleProgress = (changeState) => {
        // Hide controls after 2 intervals of video progress
        if (controlsRef.current && controlsRef.current.style.opacity === "1") {
            if (count > 1) {
                hideControls();
                count = 0;
            } else {
                count += 1;
            }
        }

        // Update state if not seeking
        if (!seeking) {
            setState(prevState => ({
                ...prevState,
                ...changeState
            }));
        }
    };

    useEffect(() => {
        screenfull.on('change', () => setState({ ...state, isFullscreen: screenfull.isFullscreen }));
    }, []);

    const handleVideoClick = (e) => {
        if (e.target === e.currentTarget && videoStarted) {
            handlePlayPause();
        }
    };

    const onPlay = () => {
        setVideoEnded(false);
        setState({ ...state, seeking: false });
    };

    const onPause = () => {
        setState({ ...state, seeking: false });
    };

    const onEnded = () => {
        updateVideoProps({ playing: false });
        setVideoEnded(true);
        if (receiving) {
            updateVideoProps({ receiving: false });
        } else if (queue.length > 0) {
            updateVideoProps({ playing: true });
            sendVideoState({
                eventName: 'syncLoadFromQueue',
                eventParams: { queue }
            });
            loadFromQueue(queue);
        }
    };

    const onReady = () => {
        if (receiving) {
            loadVideo(history[0], true);
            setVideoStarted(!playing);
        }
    };

    const onStart = () => {
        if (!receiving) setVideoStarted(true);
    };


    // Returns the key pressed
    const keyPressed = (e) => {
        return e.key;
    }

    const setKeyboardShortcuts = (e) => {
        e.preventDefault();
        const key = keyPressed(e);
        switch (key) {
            case ' ':
                handlePlayPause();
                break;
            case 'ArrowLeft':
                handleRewind();
                break;
            case 'ArrowRight':
                handleFastForward();
                break;
            case 'ArrowUp':
                handleVolumeChange([volume + 0.1]);
                break;
            case 'ArrowDown':
                handleVolumeChange([volume - 0.1]);
                break;
            case 'm':
                handleMute();
                break;
            case 'f':
                handleToggleFullscreen();
                break;
            case '0':
                handlePlaybackRate(0);
                break;
            case '1':
                handlePlaybackRate(1);
                break;
            case '2':
                handlePlaybackRate(2);
                break;
            case '3':
                handlePlaybackRate(3);
                break;
            case '4':
                handlePlaybackRate(4);
                break;
            default:
                break;
        }
    }

    // Handles focus on the video player
    // If the user clicks outside the player, remove the keyboard shortcuts
    // If the user clicks inside the player, add the keyboard shortcuts
    const handleClick = (e) => {
        const player = playerContainerRef.current;
        if (!player) return;
        // If the click was outside the player
        if (!player.contains(e.target)) {
            document.removeEventListener('keydown', setKeyboardShortcuts);
        } 
        // If the click was inside the videoPlayerContainer
        else if (e.target.classList.contains('videoPlayerContainer')) {
            document.addEventListener('keydown', setKeyboardShortcuts);
        }
    };    

    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <div
            onMouseMove={handleMouseMovement}
            onMouseLeave={handleMouseLeave}
            ref={playerContainerRef}
            className='videoPlayerContainer'
            style={{ display: 'block' }}
            // style={{ display: initVideo ? 'inline-block' : 'none' }}
            onClick={handleVideoClick}
        >
            <ReactPlayer
                className="react-player"
                // width={isFullscreen ? "100%" : "80%"}
                // height={isFullscreen ? "100%" : "80%"}
                controls={false}
                light={light}
                loop={false}
                muted={muted}
                onEnded={onEnded}
                onPause={onPause}
                onPlay={onPlay}
                onProgress={handleProgress}
                onReady={onReady}
                onStart={onStart}
                pip={pip}
                playbackRate={playbackRate}
                playing={playing}
                ref={playerRef}
                // url={videoUrl}
                url={'https://www.youtube.com/watch?v=io0UQ74sXfw'}
                volume={volume}
            />
            {/* <Controls
                playing={playing}
                muted={muted}
                volume={volume}
                played={played}
                togglePlayPause={togglePlayPause}
                toggleMute={toggleMute}
                handleVolumeChange={handleVolumeChange}
                handleSeekMouseDown={handleSeekMouseDown}
                handleSeekMouseUp={handleSeekMouseUp}
                handleSeekChange={handleSeekChange}
                handleFullscreen={handleFullscreen}
            /> */}
        </div>
    );
};

export default VideoPlayer;
