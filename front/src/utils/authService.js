const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1"

export const authService = {
  // User Registration
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include", // Include cookies
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Store token securely
      if (data.token) {
        localStorage.setItem("authToken", data.token)
        sessionStorage.setItem("authToken", data.token)
      }

      if (data.user) {
        localStorage.setItem("userInfo", JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  // User Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Store token securely
      if (data.token) {
        localStorage.setItem("authToken", data.token)
        sessionStorage.setItem("authToken", data.token)
      }

      if (data.user) {
        localStorage.setItem("userInfo", JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // User Logout
  logout: async () => {
    try {
      const token = localStorage.getItem("authToken")

      await fetch(`${API_URL}/user/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      // Clear storage
      localStorage.removeItem("authToken")
      localStorage.removeItem("userInfo")
      sessionStorage.removeItem("authToken")
      sessionStorage.removeItem("userInfo")

      return true
    } catch (error) {
      console.error("Logout error:", error)
      // Clear storage even if logout request fails
      localStorage.removeItem("authToken")
      localStorage.removeItem("userInfo")
      sessionStorage.removeItem("authToken")
      sessionStorage.removeItem("userInfo")
      return false
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return null

      const response = await fetch(`${API_URL}/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to get current user")
      }

      const data = await response.json()
      localStorage.setItem("userInfo", JSON.stringify(data.user))
      return data.user
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  },
}

export const getAuthToken = () => {
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}
