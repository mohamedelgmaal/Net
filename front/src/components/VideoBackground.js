import useMovieById from "../hooks/useMovieById";
import { useSelector } from "react-redux";

const VideoBackground = ({ movieId, bool = false }) => {
  const trailerMovie = useSelector((store) =>
    bool
      ? store.movie.dialogTrailerMovie
      : store.movie.mainTrailerMovie
  );

  useMovieById(movieId, bool);

  const videoKey = trailerMovie?.key;

  return (
    <div
      className={`relative w-full overflow-hidden bg-black ${
        bool ? "rounded-lg" : ""
      }`}
    >
      {videoKey ? (
        <div className="relative aspect-video w-full">
          <iframe
            key={videoKey}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&rel=0`}
            title="Movie Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />

          <div className="pointer-events-none absolute inset-0 z-10 bg-black/30" />

          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-zinc-950 text-center text-sm text-zinc-400">
          جاري تحميل الفيديو أو لا يوجد تريلر متاح.
        </div>
      )}
    </div>
  );
};

export default VideoBackground;