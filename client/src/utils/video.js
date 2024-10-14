// Desc: Utility functions for video related operations

// Insert an item into an array at a specified index
const insert = (arr, index, newItem) => [
    ...arr.slice(0, index),
    newItem,
    ...arr.slice(index)
];

// Get the type of video from the URL
const getVideoType = (url) => {
    if (validateYouTubeUrl(url)) {
        return 'youtube';
    } else {
        return null;
    }
}

// Check if a string is a valid URL
function isValidURL(str) {
    try {
        new URL(str); // If this works, it's a valid URL
        return true;
    } catch (e) {
        return false;
    }
}

// Validate a YouTube URL
const validateYouTubeUrl = (url) => {
    const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})(?:\S+)?$/;
    const matches = url.match(pattern);
    return matches ? matches[1] : false;
};

const parseYT = (url) => {
    const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})(?:\S+)?$/;
    const matches = url.match(pattern);
    return matches ? matches[1] : false;
}


export {
    insert, 
    isValidURL,
    getVideoType,
    parseYT,
    validateYouTubeUrl
};