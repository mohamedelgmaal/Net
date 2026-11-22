import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Get TMDB API Key from environment variables
const getTMDBHeaders = () => {
  const apiKey = process.env.TMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is missing in .env");
  }

  return {
    accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
};

// Handle TMDB API errors
const handleTMDBError = (error, res, operation) => {
  console.error(
    `${operation} Error:`,
    error.response?.data || error.message
  );

  if (error.message === "TMDB_API_KEY is missing in .env") {
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
  }

  if (error.response) {
    return res.status(502).json({
      success: false,
      message: "Movie service is temporarily unavailable",
    });
  }

  if (error.code === "ECONNABORTED") {
    return res.status(504).json({
      success: false,
      message: "Movie service request timed out",
    });
  }

  return res.status(500).json({
    success: false,
    message: "An internal server error occurred",
  });
};

// Get Movies from TMDB
export const getMovies = async (req, res) => {
  try {
    const { category } = req.params;

    const allowedCategories = [
      "now_playing",
      "popular",
      "top_rated",
      "upcoming",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie category",
      });
    }

    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${category}`,
      {
        headers: getTMDBHeaders(),
        params: {
          language: "en-US",
          page: 1,
        },
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      results: response.data.results,
    });
  } catch (error) {
    return handleTMDBError(error, res, "Get Movies");
  }
};

// Search Movies
export const searchMovies = async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Movie search query is required",
      });
    }

    const response = await axios.get(
      `${TMDB_BASE_URL}/search/movie`,
      {
        headers: getTMDBHeaders(),
        params: {
          query,
          include_adult: false,
          language: "en-US",
          page: 1,
        },
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      results: response.data.results,
    });
  } catch (error) {
    return handleTMDBError(error, res, "Search Movies");
  }
};

// Get Movie Trailer
export const getMovieVideos = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${id}/videos`,
      {
        headers: getTMDBHeaders(),
        params: {
          language: "en-US",
        },
        timeout: 10000,
      }
    );

    return res.status(200).json({
      success: true,
      results: response.data.results,
    });
  } catch (error) {
    return handleTMDBError(error, res, "Get Movie Videos");
  }
};