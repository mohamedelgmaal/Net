import { useState } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { setToggle } from "../redux/movieSlice";

import { authService } from "../utils/authService";
import netflixLogo from "../assets/netflix-logo.png";

const Header = () => {
  const user = useSelector((store) => store.app.user);
  const toggle = useSelector((store) => store.movie.toggle);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const res = await authService.logout();

      if (res.success) {
        dispatch(setUser(null));
        localStorage.removeItem("userInfo");

        toast.success(res.message || "Logged out successfully");

        navigate("/login", { replace: true });
      } else {
        toast.error(res.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);

      toast.error(error.message || "Server logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleHandler = () => {
    dispatch(setToggle());
  };

  return (
    <header className="absolute left-0 top-0 z-50 flex w-full items-center justify-between gap-2 bg-gradient-to-b from-black/95 via-black/60 to-transparent px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
      <img
        src={netflixLogo}
        alt="Netflix Logo"
        className="h-auto w-20 shrink-0 object-contain sm:w-28 md:w-36"
      />

      {user && (
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <IoIosArrowDropdown
              size={20}
              color="white"
              className="shrink-0 sm:h-6 sm:w-6"
            />

            <h1
              className="max-w-[75px] truncate text-xs font-medium text-white sm:max-w-[130px] sm:text-sm md:max-w-none md:text-lg"
              title={user.fullName}
            >
              {user.fullName}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={logoutHandler}
              disabled={isLoggingOut}
              title="Logout"
              className="rounded bg-red-700 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>

            <button
              type="button"
              onClick={toggleHandler}
              title={toggle ? "Go to Home" : "Search Movies"}
              className="whitespace-nowrap rounded bg-red-700 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-red-800 sm:px-4 sm:text-sm"
            >
              {toggle ? "Home" : "Search Movie"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;