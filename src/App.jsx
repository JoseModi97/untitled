import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// API Key -
const API_KEY = '67b85ad0'; // User's API key

const INITIAL_SEARCH_TERMS = [
  "movies 2025",
  "action 2025",
  "comedy 2025",
  "sci-fi 2025",
  "drama 2025",
  "thriller 2025",
  "adventure 2025"
];

import MovieCard from './components/MovieCard'; // Import MovieCard
import MovieDetail from './components/MovieDetail';

function Home({
  searchQuery,
  handleInputChange,
  handleSubmit,
  loading,
  error,
  movies,
  searched,
  // Props for default movies
  defaultMovies,
  loadingDefaultMovies,
  defaultMoviesError
}) {
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
          <button
            type="submit"
            disabled={loading || loadingDefaultMovies || !searchQuery.trim()} // Also disable if default movies are loading
            className="search-button"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </header>

      {/* User search error takes precedence */}
      {error && <p className="error-message">{error}</p>}

      <div className="movies-container">
        {/* User search loading */}
        {loading && !error && <p>Loading movies...</p>}

        {/* User search results */}
        {!loading && !error && movies.length > 0 && (
          <>
            <h2>Search Results</h2>
            <div className="movie-list">
              {movies.map(movie => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          </>
        )}

        {/* User searched, no results from user's query, and no overriding error */}
        {!loading && !error && movies.length === 0 && searched && (
          <p>No movies found for your query. Try another search!</p>
        )}

        {/* Default movies display - only if no user search is active or has produced results/errors */}
        {!loading && !error && movies.length === 0 && !searched && (
          <>
            {loadingDefaultMovies && <p>Loading initial movie suggestions...</p>}
            {defaultMoviesError && !loadingDefaultMovies && <p className="error-message">{defaultMoviesError}</p>}
            {defaultMovies.length > 0 && !loadingDefaultMovies && !defaultMoviesError && (
              <>
                <h2>Latest from 2025</h2>
                <div className="movie-list">
                  {defaultMovies.map(movie => (
                    <MovieCard key={movie.imdbID} movie={movie} />
                  ))}
                </div>
              </>
            )}
            {/* Case where default movies also returned empty or had an error handled above */}
            {defaultMovies.length === 0 && !loadingDefaultMovies && !defaultMoviesError && (
              <p>Start by searching for a movie above!</p>
            )}
          </>
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

  // State for default movies shown on initial load
  const [defaultMovies, setDefaultMovies] = useState([]);
  const [loadingDefaultMovies, setLoadingDefaultMovies] = useState(false);
  const [defaultMoviesError, setDefaultMoviesError] = useState('');

  const fetchDefaultMovies = async () => {
    setLoadingDefaultMovies(true);
    setDefaultMoviesError('');
    setDefaultMovies([]); // Clear previous default movies

    const randomIndex = Math.floor(Math.random() * INITIAL_SEARCH_TERMS.length);
    const searchTerm = INITIAL_SEARCH_TERMS[randomIndex];

    try {
      // console.log(`Fetching default movies with term: ${searchTerm}`);
      const response = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}`);
      if (response.data.Response === "True") {
        setDefaultMovies(response.data.Search.slice(0, 10)); // Take up to 10 movies
      } else {
        setDefaultMoviesError(response.data.Error || `No initial movies found for "${searchTerm}".`);
        setDefaultMovies([]);
      }
    } catch (err) {
      console.error("API Error fetching default movies:", err);
      setDefaultMoviesError('Failed to fetch initial movie suggestions. Check connection.');
      setDefaultMovies([]);
    }
    setLoadingDefaultMovies(false);
  };

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

  useEffect(() => {
    fetchDefaultMovies();
  }, []); // Empty dependency array means this runs once on mount

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
              // Pass default movie related props
              defaultMovies={defaultMovies}
              loadingDefaultMovies={loadingDefaultMovies}
              defaultMoviesError={defaultMoviesError}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetail apiKey={API_KEY} />} />
      </Routes>
    </div>
  );
}

export default App;
