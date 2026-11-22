import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoading: false,
  isCheckingAuth: true,
  authError: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setAuthChecked: (state, action) => {
      state.isCheckingAuth = action.payload;
    },

    setAuthError: (state, action) => {
      state.authError = action.payload;
    },
  },
});

export const {
  setUser,
  setLoading,
  setAuthChecked,
  setAuthError,
} = userSlice.actions;

export default userSlice.reducer;