import React from "react";
import MovieCard from "./MovieCard";

const MovieList = ({ title, movies = [], searchMovie = false }) => {
  const movieList = Array.isArray(movies) ? movies : [];

  if (movieList.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 w-full px-4 sm:px-6 md:px-8">
      <h2
        className={`mb-3 text-xl font-bold tracking-wide sm:text-2xl ${
          searchMovie ? "text-white" : "text-white"
        }`}
      >
        {title}
      </h2>

      {/* Mobile: Grid layout */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {movieList.map((movie) => (
          <MovieCard
            key={movie.id}
            movieId={movie.id}
            posterPath={movie.poster_path}
          />
        ))}
      </div>

      {/* Tablet and Desktop: Horizontal layout */}
      <div className="hidden w-full overflow-x-auto overflow-y-hidden no-scrollbar sm:block">
        <div className="flex w-max items-start gap-4 pb-4">
          {movieList.map((movie) => (
            <MovieCard
              key={movie.id}
              movieId={movie.id}
              posterPath={movie.poster_path}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieList;