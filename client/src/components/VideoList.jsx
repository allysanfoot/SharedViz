import React from 'react'
import VideoItem from './VideoItem'

const VideoList = ({ onVideoAddToQueue, onVideoAddPlay, searchResults }) => {
    return (
        <div>
            <ul className='video-list'>
                {searchResults && searchResults.map((videoItem) => {
                    return (
                        <VideoItem 
                            onVideoAddToQueue={onVideoAddToQueue}
                            onVideoAddPlay={onVideoAddPlay}
                            key = {videoItem.id.videoId}
                            videoItem = {videoItem}
                        />
                    )
                })
                }
            </ul>
        </div>
    )
}

export default VideoList