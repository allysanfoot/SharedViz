import React from 'react'
import axios from 'axios';
import '../styles/vidSearch.css'
import { useState, useEffect, useRef } from 'react'

// Import components
import { sckt } from './Socket'
import SearchResults from './SearchResults'
import { Input } from 'semantic-ui-react'
import { store } from 'react-notifications-component'


// Import utils
import { getVideoType, isValidURL, parseYT } from '../utils/video'

// require('dotenv').config()

const VidSearch = ({ addVideoToQueue, playSearchedVideo, updateVideoProps }) => {
    const [searchInput, setSearchInput] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const baseURL = "https://www.youtube.com/"
    const lastSearch = useRef('');

    const search = async ({ term, page = 1 }) => {
        try {
            const limit = window.matchMedia('(max-width: 960px)').matches ? 8 : 9;
            setLoading(true);

            const response = await axios.get(`${baseURL}/ytsearch`, {
                params: { query: term, page, limit },
            });

            setSearchResults(response.data.results || []);
            setPage(page);
        } catch (error) {
            console.error("Search failed:", error.message);
            store.addNotification({
                title: "Search Error",
                message: "Failed to fetch search results. Please try again.",
                type: "danger",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeInUp"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                    duration: 5000,
                    onScreen: false,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const getYoutubeVideo = async (youtubeURL) => {
        try {
            const videoId = parseYT(youtubeURL);
            if (!videoId) throw new Error("Invalid YouTube URL");

            setLoading(true);

            const response = await axios.get(`${baseURL}/ytvideo`, {
                params: { videoId },
            });

            const searchItem = response.data.results?.[0];
            if (searchItem) {
                playSearchedVideo(searchItem);
            } else {
                throw new Error("No video found");
            }
        } catch (error) {
            console.error("Failed to fetch YouTube video:", error.message);
            store.addNotification({
                title: "Error",
                message: error.message || "An error occurred while fetching the video.",
                type: "danger",
                insert: "top",
                container: "bottom-right",
                animationIn: ["animated", "fadeInUp"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                    duration: 5000,
                    onScreen: false,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = async (event) => {
        event.preventDefault();

        const trimInput = searchInput.trim();
        if (!trimInput || trimInput === lastSearch.current) return;

        lastSearch.current = trimInput;

        if (isValidURL(trimInput)) {
            const videoType = getVideoType(trimInput);
            updateVideoProps({ videoType });

            const videoHandlers = {
                youtube: getYoutubeVideo,
            };

            const handleVideo = videoHandlers[videoType];
            if (handleVideo) {
                handleVideo(trimInput);
            } else {
                showUnsupportedNotification();
            }
        } else {
            // Search the term on YouTube
            search({ term: trimInput, page: 1 });
            updateVideoProps({ videoType: 'youtube' });
        }
    };

    const showUnsupportedNotification = () => {
        store.addNotification({
            title: "Oh no!",
            message: "We apologize. At the moment, only YouTube links are supported.",
            type: "info",
            insert: "top",
            container: "bottom-right",
            animationIn: ["animated", "fadeInUp"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
                duration: 5000,
                onScreen: false,
            },
        });
    };

    return (
        <div className='video-queue-container'>
            <h1>Add a video to the queue</h1>
            <Input
                fluid
                id='searchInput'
                size='small'
                placeholder='Search or insert a YouTube URL'
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' ? handlePlay(e) : null}
                action={{
                    content: "Search",
                    loading,
                    onClick: (e) => searchInput.trim() !== '' ? handlePlay(e) : null
                }}
            />
            <SearchResults
                addVideoToQueue={addVideoToQueue}
                loading={loading}
                page={page}
                playSearchedVideo={playSearchedVideo}
                search={search}
                searchInput={searchInput}
                searchResults={searchResults}
            />
        </div>
    )
}

export default VidSearch