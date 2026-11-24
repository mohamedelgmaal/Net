"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import Header from "./Header";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setLoading, setUser } from "../redux/userSlice";
import { authService } from "../utils/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(
    (store) => store.app.isLoading
  );

  // Google Login Setup
  useEffect(() => {
    let cancelled = false;

    const initializeGoogle = async () => {
      try {
        const clientId = await authService.getGoogleClientId();

        if (cancelled) return;

        const renderGoogleButton = () => {
          if (
            cancelled ||
            !window.google?.accounts?.id
          ) {
            return;
          }

          window.google.accounts.id.initialize({
            client_id: clientId,

            callback: async (response) => {
              if (!response.credential) {
                toast.error("Google authentication failed");
                return;
              }

              dispatch(setLoading(true));

              try {
                const res = await authService.googleLogin(
                  response.credential
                );

                if (res.success && res.user) {
                  dispatch(setUser(res.user));

                  toast.success(
                    res.message || "Google login successful"
                  );

                  navigate("/browse", { replace: true });
                } else {
                  toast.error(
                    res.message || "Google login failed"
                  );
                }
              } catch (error) {
                toast.error(
                  error.message || "Google login failed"
                );
              } finally {
                dispatch(setLoading(false));
              }
            },
          });

          const buttonContainer = document.getElementById(
            "google-login-button"
          );

          if (buttonContainer) {
            buttonContainer.innerHTML = "";

            window.google.accounts.id.renderButton(
              buttonContainer,
              {
                theme: "outline",
                size: "large",
                width: 350,
                text: "signin_with",
                shape: "rect",
                logo_alignment: "left",
              }
            );
          }
        };

        const existingScript = document.getElementById(
          "google-identity-script"
        );

        if (window.google?.accounts?.id) {
          renderGoogleButton();
          return;
        }

        if (existingScript) {
          existingScript.addEventListener(
            "load",
            renderGoogleButton,
            { once: true }
          );

          return;
        }

        const script = document.createElement("script");

        script.id = "google-identity-script";
        script.src =
          "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = renderGoogleButton;

        script.onerror = () => {
          if (!cancelled) {
            toast.error("Unable to load Google Sign-In");
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        if (!cancelled) {
          console.error("Google initialization error:", error);

          toast.error(
            error.message || "Google login is unavailable"
          );
        }
      }
    };

    initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  // Login Handler
  const loginHandler = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    dispatch(setLoading(true));

    try {
      const res = await authService.login(
        normalizedEmail,
        password
      );

      if (res.success && res.user) {
        dispatch(setUser(res.user));

        toast.success(res.message || "Login successful");

        navigate("/browse", { replace: true });
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (error) {
      toast.error(
        error.message || "خطأ أثناء تسجيل الدخول"
      );
    } finally {
      dispatch(setLoading(false));
      setEmail("");
      setPassword("");
      setShowPassword(false);
    }
  };

  // Input Styling
  const inputClass =
    "w-full rounded-md border border-gray-700 bg-gray-800/90 py-3.5 pl-12 pr-12 text-base text-white placeholder-gray-400 outline-none transition duration-300 focus:border-red-600 focus:ring-1 focus:ring-red-600";

  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400";

  const eyeButtonClass =
    "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white focus:outline-none";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
      <Header />

      {/* Background */}
      <div className="fixed inset-0 -z-0">
        <img
          className="h-full w-full object-cover"
          src="https://assets.nflxext.com/ffe/siteui/vlv3/dc1cf82d-97c9-409f-b7c8-6ac1718946d6/14a8fe85-b6f4-4c06-8eaf-eccf3276d557/IN-en-20230911-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
          alt="Netflix background"
        />

        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex min-h-[calc(100vh-70px)] w-full items-center justify-center px-4 py-8 sm:px-6">

        {/* Animated Neon Border */}
        <div className="register-neon-card w-full max-w-md md:max-w-lg">

          <form
            onSubmit={loginHandler}
            className="relative z-10 flex w-full flex-col items-center rounded-[10px] bg-black/95 px-6 py-10 shadow-2xl sm:px-10 sm:py-12 md:px-14"
          >
            <h1 className="mb-7 text-3xl font-bold text-white sm:text-4xl">
              Login
            </h1>

            <div className="flex w-full flex-col">

              {/* Email */}
              <div className="relative my-2 w-full">
                <Mail className={iconClass} />

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  className={inputClass}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative my-2 w-full">
                <LockKeyhole className={iconClass} />

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={inputClass}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className={eyeButtonClass}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-gray-300 transition hover:text-white hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-md bg-red-600 p-3.5 text-base font-bold text-white transition duration-300 hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-600" />

                <span className="text-sm text-gray-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-gray-600" />
              </div>

              {/* Google Login */}
              <div className="flex w-full justify-center">
                <div
                  id="google-login-button"
                  className="min-h-[44px] max-w-full"
                />
              </div>

              {/* Register Link */}
              <p className="mt-6 text-center text-sm text-gray-300 sm:text-base">
                New to Netflix?

                <span
                  onClick={() => navigate("/register")}
                  className="ml-2 cursor-pointer font-bold text-red-500 hover:text-red-400 hover:underline"
                >
                  Sign up now.
                </span>
              </p>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;