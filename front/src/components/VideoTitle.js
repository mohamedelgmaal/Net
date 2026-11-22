import { CiPlay1, CiCircleInfo } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { getId, setOpen } from "../redux/movieSlice";

const VideoTitle = ({ title, overview, movieId }) => {
  const dispatch = useDispatch();

  const handleOpenTrailer = () => {
    if (!movieId) return;

    dispatch(getId(movieId));
    dispatch(setOpen(true));
  };

  return (
    <div
      className="
        absolute inset-0 z-20
        flex h-full w-full
        items-center
        bg-gradient-to-r
        from-black/85 via-black/45 to-transparent
        px-4
        sm:px-8
        md:px-12
        lg:px-16
        text-white
      "
    >
      <div className="w-full max-w-2xl">
        <h1
          className="
            mb-2 max-w-2xl
            text-2xl font-extrabold
            leading-tight tracking-wide
            drop-shadow-lg
            sm:text-3xl
            md:mb-4 md:text-5xl
            lg:text-6xl
          "
        >
          {title}
        </h1>

        {overview && (
          <p
            className="
              mb-3 max-w-xl
              line-clamp-2
              text-xs leading-5
              text-gray-200
              drop-shadow-md
              sm:mb-5 sm:text-sm sm:leading-6
              md:line-clamp-3 md:text-base md:leading-7
              lg:text-lg
            "
          >
            {overview}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleOpenTrailer}
            disabled={!movieId}
            className="
              flex items-center gap-2
              rounded-md bg-white
              px-4 py-2
              text-xs font-bold text-black
              transition duration-300
              hover:bg-gray-300
              disabled:cursor-not-allowed disabled:opacity-50
              sm:px-6 sm:py-2.5 sm:text-sm
              md:text-base
            "
          >
            <CiPlay1 size={22} />
            <span>Play Trailer</span>
          </button>

          <button
            type="button"
            onClick={handleOpenTrailer}
            disabled={!movieId}
            className="
              flex items-center gap-2
              rounded-md bg-white/20
              px-4 py-2
              text-xs font-bold text-white
              backdrop-blur-sm
              transition duration-300
              hover:bg-white/30
              disabled:cursor-not-allowed disabled:opacity-50
              sm:px-6 sm:py-2.5 sm:text-sm
              md:text-base
            "
          >
            <CiCircleInfo size={22} />
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoTitle;