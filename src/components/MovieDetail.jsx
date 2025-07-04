import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './MovieDetail.css';

const MovieDetail = ({ apiKey }) => {
  const { id } = useParams(); // Get the movie ID from URL params
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}&plot=full`);
        if (response.data.Response === "True") {
          setMovieDetails(response.data);
        } else {
          setError(response.data.Error || 'Movie details not found.');
        }
      } catch (err) {
        setError('Failed to fetch movie details. Please check your connection.');
        console.error("API Error fetching details:", err);
      }
      setLoading(false);
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id, apiKey]);

  if (loading) {
    return <div className="movie-detail-container"><p>Loading details...</p></div>;
  }

  if (error) {
    return <div className="movie-detail-container"><p className="error-message">{error}</p><Link to="/">Go back to search</Link></div>;
  }

  if (!movieDetails) {
    return <div className="movie-detail-container"><p>No movie details available.</p><Link to="/">Go back to search</Link></div>;
  }

  const poster = movieDetails.Poster === "N/A" ? 'https://via.placeholder.com/300x450?text=No+Image' : movieDetails.Poster;

  return (
    <div className="movie-detail-container">
      <Link to="/" className="back-link">← Back to Search</Link>
      <div className="movie-detail-content">
        <img src={poster} alt={`${movieDetails.Title} Poster`} className="movie-detail-poster" />
        <div className="movie-detail-info">
          <h1>{movieDetails.Title} ({movieDetails.Year})</h1>
          <p><strong>Rated:</strong> {movieDetails.Rated}</p>
          <p><strong>Released:</strong> {movieDetails.Released}</p>
          <p><strong>Runtime:</strong> {movieDetails.Runtime}</p>
          <p><strong>Genre:</strong> {movieDetails.Genre}</p>
          <p><strong>Director:</strong> {movieDetails.Director}</p>
          <p><strong>Writer:</strong> {movieDetails.Writer}</p>
          <p><strong>Actors:</strong> {movieDetails.Actors}</p>
          <p><strong>Plot:</strong> {movieDetails.Plot}</p>
          <p><strong>Language:</strong> {movieDetails.Language}</p>
          <p><strong>Country:</strong> {movieDetails.Country}</p>
          <p><strong>Awards:</strong> {movieDetails.Awards}</p>
          {movieDetails.Ratings && movieDetails.Ratings.length > 0 && (
            <div>
              <h3>Ratings:</h3>
              <ul>
                {movieDetails.Ratings.map(rating => (
                  <li key={rating.Source}>{rating.Source}: {rating.Value}</li>
                ))}
              </ul>
            </div>
          )}
          <p><strong>IMDb Rating:</strong> {movieDetails.imdbRating} ({movieDetails.imdbVotes} votes)</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
