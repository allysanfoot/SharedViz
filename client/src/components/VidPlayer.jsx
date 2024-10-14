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

    const handleRewind = () => {
        const currentTime = playerRef.current.getCurrentTime();
        const newTime = Math.max(currentTime - 10, 0); // Ensure newTime is not negative
    
        playerRef.current.seekTo(newTime);
    
        setState((prevState) => ({
            ...prevState,
            seeking: true,
            jumpedTime: newTime,
        }));
    
        sendVideoState({
            eventName: 'syncPlay',
            eventParams: { seekTime: newTime },
        });
    };
    

    return (
        <div className="player-container" ref={playerContainerRef}>
            {/* <ReactPlayer
                ref={playerRef}
                className="react-player"
                url={'https://www.youtube.com/watch?v=io0UQ74sXfw'}
                playing={playing}
                muted={muted}
                volume={volume}
                onProgress={handleProgress}
            /> */}
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
