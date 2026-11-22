import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getPopularMovie } from "../redux/movieSlice";

const usePopularMovies = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();

    const fetchPopularMovies = async () => {
      try {
        const res = await axios.get("/api/movies/popular", {
          signal: controller.signal,
        });

        if (res.data.success) {
          dispatch(getPopularMovie(res.data.results));
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;

        console.error(
          "Error fetching popular movies:",
          error.response?.data || error.message
        );
      }
    };

    fetchPopularMovies();

    return () => {
      controller.abort();
    };
  }, [dispatch]);
};

export default usePopularMovies;