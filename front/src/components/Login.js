"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setLoading, setUser } from "../redux/userSlice";
import { authService } from "../utils/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    }
  };

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
        <form
          onSubmit={loginHandler}
          className="
            flex w-full max-w-md
            flex-col items-center
            rounded-lg bg-black/85
            px-6 py-10
            shadow-2xl
            sm:px-10 sm:py-12
            md:max-w-lg md:px-14
          "
        >
          <h1 className="mb-7 text-3xl font-bold text-white sm:text-4xl">
            Login
          </h1>

          <div className="flex w-full flex-col">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="
                my-2 w-full rounded-md
                border border-gray-600
                bg-gray-800 px-4 py-3.5
                text-base text-white
                outline-none
                transition
                focus:border-red-600
                focus:ring-1 focus:ring-red-600
              "
              required
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              className="
                my-2 w-full rounded-md
                border border-gray-600
                bg-gray-800 px-4 py-3.5
                text-base text-white
                outline-none
                transition
                focus:border-red-600
                focus:ring-1 focus:ring-red-600
              "
              required
            />

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-gray-300 transition hover:text-white hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                mt-6 w-full rounded-md
                bg-red-600 p-3.5
                text-base font-bold text-white
                transition duration-300
                hover:bg-red-700
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
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

            <p className="mt-6 text-center text-sm text-gray-300 sm:text-base">
              New to Netflix?

              <span
                onClick={() => navigate("/register")}
                className="ml-2 cursor-pointer font-bold text-white hover:underline"
              >
                Sign up now.
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;