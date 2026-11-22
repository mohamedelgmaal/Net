import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getUpcomingMovie } from "../redux/movieSlice";

const useUpcomingMovies = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();

    const fetchUpcomingMovies = async () => {
      try {
        const res = await axios.get("/api/movies/upcoming", {
          signal: controller.signal,
        });

        if (res.data.success) {
          dispatch(getUpcomingMovie(res.data.results));
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;

        console.error(
          "Error fetching upcoming movies:",
          error.response?.data || error.message
        );
      }
    };

    fetchUpcomingMovies();

    return () => {
      controller.abort();
    };
  }, [dispatch]);
};

export default useUpcomingMovies;