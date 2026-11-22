import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  nowPlayingMovies: [],
  popularMovie: [],
  topRatedMovies: [],
  upcomingMovies: [],

  toggle: false,

  // Separate trailer states
  mainTrailerMovie: null,
  dialogTrailerMovie: null,

  // Dialog state
  open: false,
  id: "",
};

const movieSlice = createSlice({
  name: "movie",
  initialState,

  reducers: {
    getNowPlayingMovies: (state, action) => {
      state.nowPlayingMovies = action.payload;
    },

    getPopularMovie: (state, action) => {
      state.popularMovie = action.payload;
    },

    getTopRatedMovie: (state, action) => {
      state.topRatedMovies = action.payload;
    },

    getUpcomingMovie: (state, action) => {
      state.upcomingMovies = action.payload;
    },

    setToggle: (state) => {
      state.toggle = !state.toggle;
    },

    getMainTrailerMovie: (state, action) => {
      state.mainTrailerMovie = action.payload;
    },

    getDialogTrailerMovie: (state, action) => {
      state.dialogTrailerMovie = action.payload;
    },

    // Keep the old action for compatibility
    getTrailerMovie: (state, action) => {
      state.mainTrailerMovie = action.payload;
    },

    setOpen: (state, action) => {
      state.open = action.payload;
    },

    getId: (state, action) => {
      state.id = action.payload;
    },
  },
});

export const {
  getNowPlayingMovies,
  getPopularMovie,
  getTopRatedMovie,
  getUpcomingMovie,
  setToggle,
  getMainTrailerMovie,
  getDialogTrailerMovie,
  getTrailerMovie,
  setOpen,
  getId,
} = movieSlice.actions;

export default movieSlice.reducer;