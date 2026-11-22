 "src/components/ForgotPassword.jsx"

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import { authService } from "../utils/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (value) => {
    const bytes = new TextEncoder().encode(value).length;
    return value.length >= 8 && bytes <= 72;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return toast.error("Please enter your email address");
    }

    try {
      setLoading(true);

      await authService.forgotPassword(normalizedEmail);

      setEmail(normalizedEmail);
      setStep(2);

      toast.success("If an eligible account exists, a reset code has been sent.");
    } catch (error) {
      toast.error(error.message || "Unable to process your request");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      return toast.error("Please enter the 6-digit verification code");
    }

    if (!validatePassword(password)) {
      return toast.error(
        "Password must be at least 8 characters and no more than 72 UTF-8 bytes"
      );
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      await authService.resetPassword(
        email,
        code,
        password
      );

      toast.success("Password reset successfully");

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      <Header />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24">
        <div className="w-full max-w-md rounded-lg bg-black/80 px-6 py-10 shadow-2xl sm:px-10">
          <h1 className="mb-3 text-3xl font-bold">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h1>

          <p className="mb-8 text-sm leading-6 text-gray-400">
            {step === 1
              ? "Enter your email address and we'll help you reset your password."
              : "Enter the verification code sent to your email and choose a new password."}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                required
                className="w-full rounded bg-[#333] px-4 py-4 text-white outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-red-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-red-600 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full text-sm text-gray-400 transition hover:text-white"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded bg-[#222] px-4 py-4 text-gray-400 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit code"
                  required
                  className="w-full rounded bg-[#333] px-4 py-4 text-center tracking-[0.5em] text-white outline-none placeholder:tracking-normal focus:ring-2 focus:ring-red-600"
                />
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                autoComplete="new-password"
                required
                className="w-full rounded bg-[#333] px-4 py-4 text-white outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-red-600"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                autoComplete="new-password"
                required
                className="w-full rounded bg-[#333] px-4 py-4 text-white outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-red-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-red-600 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setCode("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="w-full text-sm text-gray-400 transition hover:text-white"
              >
                Change Email Address
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;