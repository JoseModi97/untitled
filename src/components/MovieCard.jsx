import React from 'react';
import { Link } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const poster = movie.Poster === "N/A" ? 'https://via.placeholder.com/200x300?text=No+Image' : movie.Poster;

  return (
    <Link to={`/movie/${movie.imdbID}`} className="movie-card-link">
      <div className="movie-card">
        <img src={poster} alt={`${movie.Title} Poster`} className="movie-card-poster" />
        <div className="movie-card-info">
          <h3 className="movie-card-title">{movie.Title}</h3>
          <p className="movie-card-year">{movie.Year}</p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
