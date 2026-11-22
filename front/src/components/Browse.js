import Header from "./Header";
import { useSelector } from "react-redux";

import MainContainer from "./MainContainer";
import MovieContainer from "./MovieContainer";

import useNowPlayingMovies from "../hooks/useNowPlayingMovies";
import usePopularMovies from "../hooks/usePopularMovies";
import useTopRatedMovies from "../hooks/useTopRatedMovies";
import useUpcomingMovies from "../hooks/useUpcomingMovies";

import SearchMovie from "./SearchMovie";

const Browse = () => {
  const toggle = useSelector((store) => store.movie.toggle);

  // Load movies
  useNowPlayingMovies();
  usePopularMovies();
  useTopRatedMovies();
  useUpcomingMovies();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black">
      <Header />

      <main className="min-h-screen w-full">
        {toggle ? (
          <SearchMovie />
        ) : (
          <>
            <MainContainer />
            <MovieContainer />
          </>
        )}
      </main>
    </div>
  );
};

export default Browse;