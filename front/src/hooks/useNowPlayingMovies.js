import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getNowPlayingMovies } from "../redux/movieSlice";

const useNowPlayingMovies = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();

    const fetchNowPlayingMovies = async () => {
      try {
        const res = await axios.get("/api/movies/now_playing", {
          signal: controller.signal,
        });

        if (res.data.success) {
          dispatch(getNowPlayingMovies(res.data.results));
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;

        console.error(
          "Error fetching now playing movies:",
          error.response?.data || error.message
        );
      }
    };

    fetchNowPlayingMovies();

    return () => {
      controller.abort();
    };
  }, [dispatch]);
};

export default useNowPlayingMovies;