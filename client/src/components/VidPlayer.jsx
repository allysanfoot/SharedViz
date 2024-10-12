// VideoPlayer.js
import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';

// Import components
import Controls from './Controls';

// Import styles
import '../styles/vidPlayer.css'

const VideoPlayer = ({ url, autoPlay = false }) => {
    const [playing, setPlaying] = useState(autoPlay);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);

    const togglePlayPause = () => {
        setPlaying(!playing);
    };

    const toggleMute = () => {
        setMuted(!muted);
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
        setMuted(e.target.value === 0);
    };

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        playerRef.current.seekTo(parseFloat(e.target.value));
    };

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleFullscreen = () => {
        if (screenfull.isEnabled) {
            screenfull.toggle(playerContainerRef.current);
        }
    };

    return (
        <div className="player-container" ref={playerContainerRef}>
            <ReactPlayer
                ref={playerRef}
                className="react-player"
                url={'https://www.youtube.com/watch?v=io0UQ74sXfw'}
                playing={playing}
                muted={muted}
                volume={volume}
                onProgress={handleProgress}
            />
            <Controls 
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
            />
        </div>
    );
};

export default VideoPlayer;
