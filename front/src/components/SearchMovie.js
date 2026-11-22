import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSearchMovieDetails } from "../redux/searchSlice";
import { setLoading } from "../redux/userSlice";
import MovieList from "./MovieList";

const SearchMovie = () => {
  const [searchMovie, setSearchMovie] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const dispatch = useDispatch();

  const isLoading = useSelector((store) => store.app.isLoading);

  const { movieName, searchedMovie } = useSelector(
    (store) => store.searchMovie
  );

  const submitHandler = async (e) => {
    e.preventDefault();

    const query = searchMovie.trim();

    if (!query || isLoading) return;

    dispatch(setLoading(true));
    setErrorMessage("");
    setHasSearched(false);

    try {
      const res = await axios.get("/api/movies/search", {
        params: { query },
        withCredentials: true,
      });

      const movies = Array.isArray(res?.data?.results)
        ? res.data.results
        : [];

      dispatch(
        setSearchMovieDetails({
          searchMovie: query,
          movies,
        })
      );

      setHasSearched(true);
    } catch (error) {
      console.error(
        "Search Movie Error:",
        error.response?.data || error.message
      );

      dispatch(
        setSearchMovieDetails({
          searchMovie: "",
          movies: [],
        })
      );

      setErrorMessage("حدث خطأ أثناء البحث. حاول مرة أخرى.");
    } finally {
      dispatch(setLoading(false));
      setSearchMovie("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-black px-4 pb-10 sm:px-6">
      <div className="flex w-full justify-center pt-24 sm:pt-28 md:pt-32">
        <form onSubmit={submitHandler} className="w-full max-w-2xl">
          <div className="flex w-full items-center gap-2 rounded-lg border border-gray-600 bg-white p-2 shadow-lg transition focus-within:border-red-600">
            <input
              value={searchMovie}
              onChange={(e) => setSearchMovie(e.target.value)}
              className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-2 text-sm text-black outline-none placeholder:text-gray-500 sm:px-3 sm:text-base"
              type="text"
              placeholder="Search Movies..."
              aria-label="Search movies"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={isLoading || !searchMovie.trim()}
              className="shrink-0 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:text-base"
            >
              {isLoading ? "Loading..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        {errorMessage ? (
          <p className="text-center text-sm text-red-500 sm:text-base">
            {errorMessage}
          </p>
        ) : hasSearched && searchedMovie.length > 0 ? (
          <MovieList
            title={movieName}
            searchMovie={true}
            movies={searchedMovie}
          />
        ) : hasSearched ? (
          <h2 className="text-center text-lg font-semibold text-white">
            Movie Not Found!!
          </h2>
        ) : null}
      </div>
    </div>
  );
};

export default SearchMovie;