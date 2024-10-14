import React from 'react'

// Import components
import { Button } from 'semantic-ui-react';

const SearchResults = ({ addVideoToQueue, loading, page, playSearchedVideo, search, searchInput, searchResults }) => {
    const handlePreviousPage = () => {
        if (page > 1) search({ term: searchInput, page: page - 1 });
    }

    const handleNextPage = () => {
        search({ term: searchInput, page: page + 1 });
    }

    return (
        //TODO: List search results
        <div className='navigation'>
            <Button.Group>
                <Button onClick={handlePreviousPage} disabled={page - 1 < 1}>Prev</Button>
                <Button.Or text={page} />
                <Button onClick={handleNextPage} disabled={searchResults.length < 8}>Next</Button>
            </Button.Group>
        </div>
    )
}

export default SearchResults