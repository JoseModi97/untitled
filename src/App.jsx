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
  defaultMoviesError,
  // Props for infinite scroll of default movies
  fetchDefaultMovies,
  defaultMoviesPage,
  setDefaultMoviesPage,
  hasMoreDefaultMovies,
  loadingMoreDefaultMovies
}) {

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're near the bottom of the page
      // window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - buffer
      // A buffer (e.g., 100-200px) ensures the call is made before the user hits the absolute bottom.
      const buffer = 200; // pixels
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - buffer &&
        !loadingMoreDefaultMovies &&
        hasMoreDefaultMovies
      ) {
        // User has scrolled to the bottom, not currently loading, and there are more movies
        const nextPage = defaultMoviesPage + 1;
        setDefaultMoviesPage(nextPage); // Update page count
        fetchDefaultMovies(nextPage);   // Fetch next page
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMoreDefaultMovies, hasMoreDefaultMovies, defaultMoviesPage, fetchDefaultMovies, setDefaultMoviesPage]);

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
            {/* Loading indicator for infinite scroll */}
            {loadingMoreDefaultMovies && <p>Loading more movies...</p>}
            {/* Message when all default movies have been loaded */}
            {!loadingMoreDefaultMovies && !hasMoreDefaultMovies && defaultMovies.length > 0 && <p>You've seen all movies from 2025 for this list!</p>}
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
  const [loadingDefaultMovies, setLoadingDefaultMovies] = useState(false); // For initial load
  const [defaultMoviesError, setDefaultMoviesError] = useState('');
  const [defaultMoviesPage, setDefaultMoviesPage] = useState(1);
  const [hasMoreDefaultMovies, setHasMoreDefaultMovies] = useState(true);
  const [loadingMoreDefaultMovies, setLoadingMoreDefaultMovies] = useState(false); // For pagination

  const fetchDefaultMovies = async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setLoadingDefaultMovies(true);
      setDefaultMoviesError('');
      setDefaultMovies([]); // Reset for the first page
      setHasMoreDefaultMovies(true); // Assume more until proven otherwise
      setDefaultMoviesPage(1); // Ensure page state is reset
    } else {
      setLoadingMoreDefaultMovies(true);
    }

    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?apikey=${API_KEY}&s=movie&y=2025&type=movie&page=${pageToFetch}`
      );

      if (response.data.Response === "True" && response.data.Search) {
        const newMovies = response.data.Search.filter(movie => movie.Type === 'movie');

        if (newMovies.length > 0) {
          setDefaultMovies(prevMovies => pageToFetch === 1 ? newMovies : [...prevMovies, ...newMovies]);
          const totalResults = parseInt(response.data.totalResults, 10);
          // Check if current movies + new movies >= totalResults
          // Need to access defaultMovies directly from state if pageToFetch > 1 for accurate length
          const currentMovieCount = pageToFetch === 1 ? newMovies.length : defaultMovies.length + newMovies.length;
          if (currentMovieCount >= totalResults) {
            setHasMoreDefaultMovies(false);
          }
        } else if (pageToFetch === 1) { // No movies found on the very first fetch
          setDefaultMoviesError('No movies found for 2025 at this time. Try searching manually!');
          setHasMoreDefaultMovies(false);
        } else { // No more movies found on subsequent fetches
          setHasMoreDefaultMovies(false);
        }
      } else { // API response is "False" or Search array is missing
        if (pageToFetch === 1) {
          setDefaultMoviesError(response.data.Error || 'Could not find movies from 2025.');
        }
        setHasMoreDefaultMovies(false); // No more results if API error or no data
      }
    } catch (err) {
      console.error(`Error fetching 2025 movies (page ${pageToFetch}):`, err);
      if (pageToFetch === 1) {
        setDefaultMoviesError('An error occurred while fetching movies for 2025.');
      }
      setHasMoreDefaultMovies(false); // Stop trying if there's an error
    } finally {
      if (pageToFetch === 1) {
        setLoadingDefaultMovies(false);
      } else {
        setLoadingMoreDefaultMovies(false);
      }
    }
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
              // Props for infinite scroll of default movies
              fetchDefaultMovies={fetchDefaultMovies}
              defaultMoviesPage={defaultMoviesPage}
              setDefaultMoviesPage={setDefaultMoviesPage}
              hasMoreDefaultMovies={hasMoreDefaultMovies}
              loadingMoreDefaultMovies={loadingMoreDefaultMovies}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetail apiKey={API_KEY} />} />
      </Routes>
    </div>
  );
}

export default App;
