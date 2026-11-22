import MovieList from "./MovieList";
import { useSelector } from "react-redux";

const MovieContainer = () => {
  const movie = useSelector((store) => store.movie);

  return (
    <div className="relative z-10 w-full bg-black pb-8 sm:pb-10 md:pb-12">
      <div className="w-full space-y-4 pt-5 sm:space-y-6 sm:pt-7 md:space-y-8 md:pt-8">
        <MovieList
          title="Popular Movies"
          movies={movie.popularMovie ?? []}
        />

        <MovieList
          title="Now Playing Movies"
          movies={movie.nowPlayingMovies ?? []}
        />

        <MovieList
          title="Top Rated Movies"
          movies={movie.topRatedMovies ?? []}
        />

        <MovieList
          title="Upcoming Movies"
          movies={movie.upcomingMovies ?? []}
        />
      </div>
    </div>
  );
};

export default MovieContainer;