import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// API Key -
const API_KEY = '67b85ad0'; // User's API key

import MovieCard from './components/MovieCard'; // Import MovieCard
import MovieDetail from './components/MovieDetail';

function Home({ searchQuery, handleInputChange, handleSubmit, loading, error, movies, searched }) {
  return (
    <>
      <header className="App-header">
        <h1><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Movie Search</Link></h1>
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
          <div className="movie-list">
            {movies.map(movie => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

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
    if (searched && event.target.value.trim() === '') {
      setMovies([]);
      setError('');
      setSearched(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Home
              searchQuery={searchQuery}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              loading={loading}
              error={error}
              movies={movies}
              searched={searched}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetail apiKey={API_KEY} />} />
      </Routes>
    </div>
  );
}

export default App;
