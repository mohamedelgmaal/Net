import { useState, useEffect } from "react";
import Header from "./Header";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setLoading, setUser } from "../redux/userSlice";
import { authService } from "../utils/authService";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(
    (store) => store.app.isLoading
  );

  // Google Register Setup
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
                    res.message || "Google registration successful"
                  );

                  navigate("/browse", { replace: true });
                } else {
                  toast.error(
                    res.message || "Google registration failed"
                  );
                }
              } catch (error) {
                toast.error(
                  error.message || "Google registration failed"
                );
              } finally {
                dispatch(setLoading(false));
              }
            },
          });

          const buttonContainer = document.getElementById(
            "google-register-button"
          );

          if (buttonContainer) {
            buttonContainer.innerHTML = "";

            window.google.accounts.id.renderButton(
              buttonContainer,
              {
                theme: "outline",
                size: "large",
                width: 350,
                text: "signup_with",
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
            error.message || "Google registration is unavailable"
          );
        }
      }
    };

    initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isStrongPassword = (value) => {
    return (
      value.length >= 8 &&
      new TextEncoder().encode(value).length <= 72
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !fullName.trim() ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (
      fullName.trim().length < 2 ||
      fullName.trim().length > 100
    ) {
      toast.error(
        "Full name must be between 2 and 100 characters"
      );
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be at least 8 characters and no more than 72 bytes"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(setLoading(true));

    try {
      const response = await authService.register({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
      });

      if (response.success) {
        toast.success(
          response.message ||
            "Registration successful. Check your email."
        );

        navigate("/verify-email", {
          state: { email: normalizedEmail },
          replace: true,
        });
      } else {
        toast.error(
          response.message || "Registration failed"
        );
      }
    } catch (error) {
      toast.error(error.message || "Error while registering");
    } finally {
      dispatch(setLoading(false));
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
          alt="Background"
        />

        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Register Form */}
      <div className="relative z-10 flex min-h-[calc(100vh-70px)] w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <form
          onSubmit={handleRegister}
          className="flex w-full max-w-md flex-col items-center rounded-lg bg-black/85 px-6 py-8 shadow-2xl sm:px-10 sm:py-10 md:max-w-lg md:px-14"
        >
          <h1 className="mb-5 text-3xl font-bold text-white sm:mb-7 sm:text-4xl">
            Sign Up
          </h1>

          <div className="flex w-full flex-col">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              maxLength={100}
              className="my-2 w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-3 text-base text-white outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
              required
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="my-2 w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-3 text-base text-white outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
              required
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password (minimum 8 characters)"
              autoComplete="new-password"
              className="my-2 w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-3 text-base text-white outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
              required
            />

            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              className="my-2 w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-3 text-base text-white outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 w-full rounded-md bg-red-600 p-3.5 text-base font-bold text-white transition duration-300 hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-600" />

              <span className="text-sm text-gray-400">
                OR
              </span>

              <div className="h-px flex-1 bg-gray-600" />
            </div>

            {/* Google Register */}
            <div className="flex w-full justify-center">
              <div
                id="google-register-button"
                className="min-h-[44px] max-w-full"
              />
            </div>

            <p className="mt-6 text-center text-sm text-gray-300 sm:text-base">
              Already have an account?

              <span
                onClick={() => navigate("/login")}
                className="ml-2 cursor-pointer font-bold text-white hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;