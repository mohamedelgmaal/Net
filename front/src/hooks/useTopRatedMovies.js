import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getTopRatedMovie } from "../redux/movieSlice";

const useTopRatedMovies = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();

    const fetchTopRatedMovies = async () => {
      try {
        const res = await axios.get("/api/movies/top_rated", {
          signal: controller.signal,
        });

        if (res.data.success) {
          dispatch(getTopRatedMovie(res.data.results));
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;

        console.error(
          "Error fetching top rated movies:",
          error.response?.data || error.message
        );
      }
    };

    fetchTopRatedMovies();

    return () => {
      controller.abort();
    };
  }, [dispatch]);
};

export default useTopRatedMovies;