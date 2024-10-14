import React, { useEffect } from 'react'
import VidPlayer from './VidPlayer'
import VidSearch from './VidSearch'
import { insert } from '../utils/video'
import { sckt } from './Socket'

import { Button, Divider, Grid, Header, Icon, Segment } from 'semantic-ui-react';

const Video = ({ logMessage, currUser, room, videoProps, updateVideoProps, playerRef, sendVideoState, loadVideo, playSearchedVideo, getVideoFromSearch }) => {
    // Load a video from the queue
    const loadFromQueue = (queue, sync = false) => {
        let nextVideo = queue.shift(); // Remove from beginning of queue
        // If the queue is empty, load the next video from the history
        if (nextVideo !== undefined) {
            loadVideo(nextVideo, sync);
            updateVideoProps({ queue }); // Update the queue
            updateVideoProps({ history: [nextVideo, ...videoProps.history] }); // Update the history
        }
    }

    // Modifies state of the video player
    const modifyVideoState = (paramsToChange) => {
        // Ensure the video player has been initialized
        if (playerRef.current !== null) {
            const { playing, seekTime, playbackRate } = paramsToChange;
            // Update whether the video should be playing or paused
            if (playing !== undefined) {
                updateVideoProps({ playing });
            }
            // Jump to a specific time in the video if specified
            if (seekTime !== undefined) {
                playerRef.current.seekTo(seekTime);
            }
        }
    }

    // Add a video to the queue
    const addVideoToQueue = (videoItem) => {
        let { queue } = videoProps;
        let updatedQueue = insert(queue, queue.length, videoItem)
        sendVideoState({
            eventName: "syncQueue",
            eventParams: {
                queue: updatedQueue,
                type: "add"
            }
        });
        updateVideoProps({ queue: updatedQueue });
    }

    useEffect(() => {
        const getSyncHandler = ({ id }) => {
            logMessage("New user needs videoProps to sync.", 'server');

            if (!playerRef.current) return;

            const params = {
                id,
                ...videoProps,
                seekTime: playerRef.current.getCurrentTime(),
                receiving: true,
            };

            sckt.socket.emit('sendSync', params);
        };

        // Register event listener
        sckt.socket.on('getSync', getSyncHandler);

        // Cleanup listener on unmount
        return () => sckt.socket.off('getSync', getSyncHandler);
    }, [videoProps]); // Add videoProps to dependencies to avoid stale data.


    useEffect(() => {
        // Handler to sync the full video state
        const startSyncHandler = (videoProps) => {
            logMessage("I'm syncing.", 'server');
            updateAndModifyVideoState(videoProps);
        };

        // Handler for individual video events from other users
        const receiveVideoStateHandler = ({ eventName, eventParams = {} }) => {
            updateVideoProps({ receiving: true });

            const actions = {
                syncPlay: () => updateAndModifyVideoState({ playing: true }),
                syncPause: () => updateAndModifyVideoState({ playing: false, seekTime: eventParams.seekTime }),
                syncSeek: () => updateAndModifyVideoState({ seekTime: eventParams.seekTime }),
                syncRateChange: () => updateAndModifyVideoState({ playbackRate: eventParams.playbackRate }),
                syncLoad: () => {
                    loadVideo(eventParams.searchItem, false);
                    updateVideoProps({ history: eventParams.history });
                },
                syncLoadFromQueue: () => loadFromQueue(eventParams.queue),
                syncQueue: () => updateVideoProps({ queue: eventParams.queue }),
            };

            // Execute the matching action if available
            actions[eventName]?.();
        };

        // Utility function to update both state objects
        const updateAndModifyVideoState = (props) => {
            updateVideoProps(props);
            modifyVideoState(props);
        };

        sckt.socket.on("startSync", startSyncHandler);
        sckt.socket.on("receiveVideoState", receiveVideoStateHandler);
        return () => {
            sckt.socket.off('startSync', startSyncHandler);
            sckt.socket.off('receiveVideoState', receiveVideoStateHandler);
        };
    }, []);


    return (
        <div>
            <VidSearch
                addVideoToQueue={addVideoToQueue}
                playSearchedVideo={playSearchedVideo}
                updateVideoProps={updateVideoProps}
            />
            <VidPlayer
                videoProps={videoProps}
                sendVideoState={sendVideoState}
                updateVideoProps={updateVideoProps}
                playerRef={playerRef}
                loadVideo={loadVideo}
                loadFromQueue={loadFromQueue}
            />
        </div>
    )
}

export default Video