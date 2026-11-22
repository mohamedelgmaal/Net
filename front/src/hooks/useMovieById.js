import axios from "axios";
import { useDispatch } from "react-redux";
import {
  getMainTrailerMovie,
  getDialogTrailerMovie,
} from "../redux/movieSlice";
import { useEffect } from "react";

const useMovieById = (movieId, isDialog = false) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const setTrailer = isDialog
      ? getDialogTrailerMovie
      : getMainTrailerMovie;

    if (!movieId) {
      dispatch(setTrailer(null));
      return;
    }

    const controller = new AbortController();

    const getMovieById = async () => {
      dispatch(setTrailer(null));

      try {
        const res = await axios.get(
          `/api/movies/${movieId}/videos`,
          {
            signal: controller.signal,
          }
        );

        const videos = Array.isArray(res?.data?.results)
          ? res.data.results
          : [];

        const trailer =
          videos.find(
            (item) =>
              item.type === "Trailer" &&
              item.site === "YouTube" &&
              item.key
          ) ||
          videos.find(
            (item) => item.site === "YouTube" && item.key
          ) ||
          null;

        if (!controller.signal.aborted) {
          dispatch(setTrailer(trailer));
        }
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          console.error(
            "Error fetching movie videos:",
            error.response?.data || error.message
          );

          if (!controller.signal.aborted) {
            dispatch(setTrailer(null));
          }
        }
      }
    };

    getMovieById();

    return () => {
      controller.abort();
    };
  }, [movieId, isDialog, dispatch]);
};

export default useMovieById;