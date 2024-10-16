import React from 'react'

// Import components

const VideoItem = ({ onVideoAddToQueue, onVideoAddPlay, key, videoItem }) => {
    // Change the icon of the queue button to a checkmark for 2 seconds
    const changeQueueIcon = (target) => {
        target.setAttribute("class", "check icon");
        setTimeout(() => {
            target.setAttribute("class", "plus icon");
        }, 2000)
    }

    return (
        //TODO: Display video item
        <div>VideoItem</div>
    )
}

export default VideoItem