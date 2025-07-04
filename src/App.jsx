import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// API Key -
const API_KEY = '67b85ad0'; // User's API key

/*
const INITIAL_SEARCH_TERMS = [
  "movies 2025",
  "action 2025",
  "comedy 2025",
  "sci-fi 2025",
  "drama 2025",
  "thriller 2025",
  "adventure 2025"
];
*/

// const FEATURED_MOVIE_IDS = [ ... ]; // Removed as we are now fetching 2025 movies by search

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
            className={`search-input ${loadingDefaultMovies || loading ? 'loading-active' : ''}`}
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
        {/* User search loading: Text removed, handled by input animation */}
        {/* {loading && !error && <p>Loading movies...</p>} */}

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
        {/* Also ensure user search is not loading */}
        {!loading && !error && movies.length === 0 && !searched && (
          <>
            {/* Default movies loading: Text removed, handled by input animation */}
            {/* {loadingDefaultMovies && <p>Loading initial movie suggestions...</p>} */}
            {defaultMoviesError && !loadingDefaultMovies && <p className="error-message">{defaultMoviesError}</p>}
            {defaultMovies.length > 0 && !loadingDefaultMovies && !defaultMoviesError && (
              <>
                <h2>Movies from 2025</h2>
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
    setDefaultMovies([]);

    try {
      // Search for movies from the year 2025
      const response = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&s=movie&y=2025&type=movie`);

      if (response.data.Response === "True" && response.data.Search) {
        // Take up to the first 10 movies, or fewer if less are returned.
        // The API might not always return movies that strictly match "movie" as a title,
        // so we filter for `type=movie` again on client though API was asked for it.
        // Also, "random" is hard with this API; we're taking the API's default sort for the search term.
        const movies2025 = response.data.Search.filter(movie => movie.Type === 'movie').slice(0, 10);
        if (movies2025.length > 0) {
          setDefaultMovies(movies2025);
        } else {
          setDefaultMoviesError('No movies found for 2025 at this time. Try searching manually!');
        }
      } else {
        // Handle cases where Response is "False" or Search array is missing
        setDefaultMoviesError(response.data.Error || 'Could not find movies from 2025.');
      }
    } catch (err) {
      console.error("Error fetching 2025 movies:", err);
      setDefaultMoviesError('An error occurred while fetching movies for 2025.');
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
