import express from "express";

import {
  getMovies,
  searchMovies,
  getMovieVideos,
} from "./movie.controller.js";

const router = express.Router();

// Search movies
router.get("/search", searchMovies);

// Get movie trailers
router.get("/:id/videos", getMovieVideos);

// Get movie categories
router.get("/:category", getMovies);

export default router;