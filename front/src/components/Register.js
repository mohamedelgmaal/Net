"use client"

import { useState } from "react"
import Header from "./Header"
import axios from "axios"
import { API_END_POINT } from "../utils/constant"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setLoading, setUser } from "../redux/userSlice"

const Register = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isStrongPassword = (password) => {
    return password.length >= 6
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!email || !password || !fullName || !confirmPassword) {
      toast.error("Please fill all fields")
      return
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!isStrongPassword(password)) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    dispatch(setLoading(true))
    try {
      // ★★ مهم جداً: الباك اند بيستقبل fullName مش name ★★
      const userData = { fullName, email, password }

      const res = await axios.post(`${API_END_POINT}/register`, userData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })

      if (res.data.success) {
        toast.success("Registered successfully!")
        dispatch(setUser(res.data.user))
        localStorage.setItem("userInfo", JSON.stringify(res.data.user))
        navigate("/browse")
      } else {
        toast.error(res.data.message || "Registration failed")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error while registering")
    } finally {
      dispatch(setLoading(false))
      setEmail("")
      setPassword("")
      setFullName("")
      setConfirmPassword("")
    }
  }

  return (
    <div>
      <Header />
      <div className="absolute">
        <img
          className="w-[100vw] h-[100vh] bg-cover"
          src="https://assets.nflxext.com/ffe/siteui/vlv3/dc1cf82d-97c9-409f-b7c8-6ac1718946d6/14a8fe85-b6f4-4c06-8eaf-eccf3276d557/IN-en-20230911-popsignuptwoweeks-perspective_alpha_website_medium.jpg"
          alt="banner"
        />
      </div>

      <form
        onSubmit={handleRegister}
        className="flex flex-col w-3/12 p-12 my-36 left-0 right-0 mx-auto items-center justify-center absolute rounded-md bg-black opacity-90"
      >
        <h1 className="text-3xl text-white mb-5 font-bold">Sign Up</h1>

        <div className="flex flex-col w-full">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className="outline-none p-3 my-2 rounded-sm bg-gray-800 text-white"
            required
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="outline-none p-3 my-2 rounded-sm bg-gray-800 text-white"
            required
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="outline-none p-3 my-2 rounded-sm bg-gray-800 text-white"
            required
          />

          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Confirm Password"
            className="outline-none p-3 my-2 rounded-sm bg-gray-800 text-white"
            required
          />

          <button
            type="submit"
            className="bg-red-600 mt-6 p-3 text-white rounded-sm font-medium"
          >
            Sign Up
          </button>

          <p className="text-white mt-2">
            Already have an account?
            <span
              onClick={() => navigate("/login")}
              className="ml-1 text-blue-900 font-medium cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register