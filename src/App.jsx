import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API Key -
const API_KEY = '67b85ad0'; // User's API key

import MovieCard from './components/MovieCard'; // Import MovieCard

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false); // To track if a search has been performed

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a movie title to search.');
      setMovies([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError('');
    setMovies([]);
    setSearched(true);

    try {
      const response = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchQuery}`);
      if (response.data.Response === "True") {
        setMovies(response.data.Search);
        setError('');
      } else {
        setMovies([]);
        setError(response.data.Error || 'No movies found.');
      }
    } catch (err) {
      setError('Failed to fetch movies. Please check your connection or the API key.');
      setMovies([]);
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
    if (searched && event.target.value.trim() === '') { // Clear results if input is cleared after a search
        setMovies([]);
        setError('');
        setSearched(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent form submission from reloading the page
    handleSearch();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Movie Search</h1>
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search for a movie..."
            className="search-input"
          />
          <button type="submit" disabled={loading || !searchQuery.trim()} className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div className="movies-container">
        {loading && !error && <p>Loading movies...</p>}
        {!loading && !error && movies.length === 0 && searched && <p>No movies found for your query. Try another search!</p>}
        {!loading && !error && movies.length > 0 && (
          <div className="movie-list"> {/* Changed ul to div for more flexible styling if needed */}
            {movies.map(movie => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
