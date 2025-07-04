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

const FEATURED_MOVIE_IDS = [
  'tt0111161', // The Shawshank Redemption (1994)
  'tt0068646', // The Godfather (1972)
  'tt0468569', // The Dark Knight (2008)
  'tt0133093', // The Matrix (1999)
  'tt0109830', // Forrest Gump (1994)
  'tt1375666', // Inception (2010)
  'tt0088763', // Back to the Future (1985)
  'tt0120338', // Titanic (1997)
  'tt0103064', // Terminator 2: Judgment Day (1991)
  'tt0076759', // Star Wars: Episode IV - A New Hope (1977)
  'tt0167260', // The Lord of the Rings: The Return of the King (2003)
  'tt0080684', // Star Wars: Episode V - The Empire Strikes Back (1980)
  'tt0137523', // Fight Club (1999)
  'tt0816692', // Interstellar (2014)
  'tt0120737', // The Lord of the Rings: The Fellowship of the Ring (2001)
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
                <h2>Featured Movies</h2>
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

    // Shuffle FEATURED_MOVIE_IDS and pick the first 7
    const shuffledIds = [...FEATURED_MOVIE_IDS].sort(() => 0.5 - Math.random());
    const selectedIds = shuffledIds.slice(0, 7);

    const moviePromises = selectedIds.map(id =>
      axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`)
    );

    try {
      const results = await Promise.allSettled(moviePromises);
      const successfullyFetchedMovies = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.data.Response === "True") {
          successfullyFetchedMovies.push(result.value.data);
        } else if (result.status === 'rejected' || result.value.data.Response === "False") {
          // Log individual error if needed, e.g., console.error("Failed to fetch movie:", result.reason || result.value.data.Error);
        }
      });

      if (successfullyFetchedMovies.length > 0) {
        setDefaultMovies(successfullyFetchedMovies);
      } else {
        setDefaultMoviesError('Could not load any featured movies at this time.');
      }
    } catch (err) { // This catch block might be redundant if allSettled handles all individual errors.
      console.error("Unexpected error in fetchDefaultMovies Promise.allSettled:", err);
      setDefaultMoviesError('An unexpected error occurred while fetching featured movies.');
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
