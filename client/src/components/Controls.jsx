import React from 'react'

const Controls = ({ playing, muted, volume, played, togglePlayPause, toggleMute, handleVolumeChange, handleSeekMouseDown, handleSeekMouseUp, handleSeekChange, handleFullscreen}) => {
    return (
        <div>
            <button onClick={togglePlayPause}>
                {playing ? 'Pause' : 'Play'}
            </button>
            <button onClick={toggleMute}>
                {muted ? 'Unmute' : 'Mute'}
            </button>
            <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={volume}
                onChange={handleVolumeChange}
            />
            <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
            />
            <button onClick={handleFullscreen}>Fullscreen</button>
        </div>
    )
}

export default Controls