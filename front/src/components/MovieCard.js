import React from "react";
import { TMDB_IMG_URL } from "../utils/constant";
import { useDispatch } from "react-redux";
import { getId, setOpen } from "../redux/movieSlice";

const MovieCard = ({ posterPath, movieId }) => {
  const dispatch = useDispatch();

  if (!posterPath || !movieId) return null;

  const handleOpen = () => {
    dispatch(getId(movieId));
    dispatch(setOpen(true));
  };

  const imageUrl = `${TMDB_IMG_URL}/${posterPath}`;

  return (
    <button
      type="button"
      onClick={handleOpen}
      aria-label={`Open movie details, ID ${movieId}`}
      className="
        group relative block
        w-full min-w-0
        overflow-hidden rounded-lg
        bg-zinc-900
        text-left
        transition-all duration-300 ease-out
        hover:z-20 hover:scale-105
        hover:shadow-xl hover:shadow-black/60
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-red-600
        sm:w-40 sm:flex-shrink-0
        md:w-44
        lg:w-48
      "
    >
      <img
        src={imageUrl}
        alt="Movie poster"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://placehold.co/400x600/18181b/ffffff?text=No+Image";
        }}
        className="
          block aspect-[2/3] w-full
          object-cover
          transition duration-300
          group-hover:brightness-110
        "
      />

      <div
        className="
          pointer-events-none absolute inset-0
          rounded-lg border border-white/0
          transition duration-300
          group-hover:border-white/20
        "
      />
    </button>
  );
};

export default MovieCard;