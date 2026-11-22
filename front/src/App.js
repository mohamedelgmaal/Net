import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import axios from "axios";

import MovieDialog from "./components/MovieDialog";
import Login from "./components/Login";
import Browse from "./components/Browse";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";

import { setUser, setAuthChecked } from "./redux/userSlice";
import { API_END_POINT } from "./utils/constant";

function App() {
  const dispatch = useDispatch();

  const user = useSelector((store) => store.app.user);

  const isCheckingAuth = useSelector(
    (store) => store.app.isCheckingAuth
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${API_END_POINT}/me`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success && res.data.user) {
          dispatch(setUser(res.data.user));

          localStorage.setItem(
            "userInfo",
            JSON.stringify(res.data.user)
          );
        } else {
          dispatch(setUser(null));
          localStorage.removeItem("userInfo");
        }
      } catch (error) {
        dispatch(setUser(null));
        localStorage.removeItem("userInfo");
      } finally {
        dispatch(setAuthChecked(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-red-600 sm:h-14 sm:w-14" />

          <p className="text-sm font-medium text-white sm:text-base">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen w-full overflow-x-hidden bg-black">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
          }}
        />

        <MovieDialog />

        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/browse" replace />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/browse" replace />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/browse" replace />
              ) : (
                <Register />
              )
            }
          />

          <Route
            path="/verify-email"
            element={
              user ? (
                <Navigate to="/browse" replace />
              ) : (
                <VerifyEmail />
              )
            }
          />

          <Route
            path="/forgot-password"
            element={
              user ? (
                <Navigate to="/browse" replace />
              ) : (
                <ForgotPassword />
              )
            }
          />

          <Route
            path="/browse"
            element={
              user ? (
                <Browse />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;