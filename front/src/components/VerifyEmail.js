import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import toast from "react-hot-toast";
import { authService } from "../utils/authService";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/userSlice";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(
    location.state?.email ? 60 : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef([]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleCodeChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedCode = [...code];
    updatedCode[index] = value;

    setCode(updatedCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !code[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (e.key === "ArrowRight" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    setCode([
      ...pasted.split(""),
      ...Array(6 - pasted.length).fill(""),
    ]);

    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // Verify Email
  const handleVerify = async (e) => {
    e.preventDefault();

    const verificationCode = code.join("");

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    dispatch(setLoading(true));
    setIsSubmitting(true);

    try {
      const response = await authService.verifyEmail(
        email.trim().toLowerCase(),
        verificationCode
      );

      if (response.success) {
        toast.success(
          response.message || "Email verified successfully!"
        );

        navigate("/login", { replace: true });
      } else {
        toast.error(response.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      dispatch(setLoading(false));
      setIsSubmitting(false);
    }
  };

  // Resend Verification Code
  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const response = await authService.resendVerification(
        email.trim().toLowerCase()
      );

      if (response.success) {
        toast.success(
          response.message || "A new code has been sent"
        );

        setCountdown(60);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response.message || "Unable to resend code");
      }
    } catch (error) {
      toast.error(error.message || "Unable to resend code");
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
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Verification Form */}
      <div className="relative z-10 flex min-h-[calc(100vh-70px)] items-center justify-center px-4 py-8">
        <form
          onSubmit={handleVerify}
          className="w-full max-w-md rounded-xl border border-white/10 bg-black/90 px-5 py-9 shadow-2xl sm:px-10 sm:py-12"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-red-600/40 bg-red-600/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white">
              Verify Your Email
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              We've sent a 6-digit verification code to your email.
              Enter the code below to activate your account.
            </p>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-red-600"
            />
          </div>

          <label className="mb-3 block text-center text-sm font-medium text-gray-300">
            Verification Code
          </label>

          <div
            dir="ltr"
            className="mb-7 flex justify-center gap-2 sm:gap-3"
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleCodeChange(e.target.value, index)
                }
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="h-12 w-10 rounded-md border border-gray-600 bg-gray-800 text-center text-xl font-bold text-white outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 sm:h-14 sm:w-12"
                aria-label={`Verification digit ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>

          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-gray-400">
              Didn't receive the code?
            </p>

            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend available in{" "}
                <span className="font-bold text-red-500">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-bold text-red-500 hover:text-red-400 hover:underline"
              >
                Resend Verification Code
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-7 w-full text-center text-sm text-gray-400 transition hover:text-white"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;