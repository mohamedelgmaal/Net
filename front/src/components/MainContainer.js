import VideoTitle from "./VideoTitle";
import VideoBackground from "./VideoBackground";
import { useSelector } from "react-redux";

const MainContainer = () => {
  const movie = useSelector(
    (store) => store.movie?.nowPlayingMovies
  );

  if (!Array.isArray(movie) || movie.length === 0) {
    return null;
  }

  const { overview, id, title } = movie[0] || {};

  if (!id || !title) {
    return null;
  }

  return (
    <div className="relative z-0 aspect-video w-full overflow-hidden bg-black">
      <VideoBackground movieId={id} />

     <VideoTitle
  title={title}
  overview={overview || ""}
  movieId={id}
/>
    </div>
  );
};

export default MainContainer;