import useMovieById from "../hooks/useMovieById"
import { useSelector } from "react-redux"

const VideoBackground = ({ movieId, bool }) => {
  const trailerMovie = useSelector((store) => store.movie.trailerMovie)

  useMovieById(movieId)

  return (
    <div className={`${bool ? "w-full" : "w-screen"} overflow-hidden`}>
      <iframe
        className={`${bool ? "w-[100%]" : "w-screen aspect-video"}`}
        src={`https://www.youtube.com/embed/${trailerMovie?.key}?si=HorxQfzFY2_TAO1W&autoplay=1&mute=1`}
        title="YouTube video player"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  )
}

export default VideoBackground
