const API_URL = "/api/auth";

// Common request handler
const authRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong"
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

// Google configuration request
const getGoogleClientId = async () => {
  const response = await fetch("/api/config/google", {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success || !data.clientId) {
    throw new Error(
      data.message || "Unable to load Google authentication"
    );
  }

  return data.clientId;
};

export const authService = {
  // Register
  register: (userData) =>
    authRequest("/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
      }),
    }),

  // Login
  login: (email, password) =>
    authRequest("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Google Login
  googleLogin: (credential) =>
    authRequest("/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  // Get Google Client ID
  getGoogleClientId,

  // Verify Email OTP
  verifyEmail: (email, code) =>
    authRequest("/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  // Resend Verification OTP
  resendVerification: (email) =>
    authRequest("/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Forgot Password
  forgotPassword: (email) =>
    authRequest("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Reset Password
  resetPassword: (email, code, newPassword) =>
    authRequest("/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email,
        code,
        newPassword,
      }),
    }),

  // Logout
  logout: () =>
    authRequest("/logout", {
      method: "GET",
    }),

  // Get Current Authenticated User
  getCurrentUser: () =>
    authRequest("/me", {
      method: "GET",
    }),
};

// Check Authentication
export const isAuthenticated = async () => {
  try {
    const data = await authService.getCurrentUser();
    return Boolean(data.success && data.user);
  } catch {
    return false;
  }
};