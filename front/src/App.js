import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import MovieDialog from "./components/MovieDialog"
import Login from "./components/Login"
import Browse from "./components/Browse"
import Register from "./components/Register"

function App() {
  let user = null
  try {
    const storedUser = localStorage.getItem("userInfo")
    user = storedUser ? JSON.parse(storedUser) : null
  } catch (error) {
    console.error("Invalid user data in localStorage:", error)
    localStorage.removeItem("userInfo")
    user = null
  }

  return (
    <Router>
      <div>
        <Toaster />
        <MovieDialog />
        <Routes>
          <Route path="/" element={user ? <Navigate to="/browse" /> : <Login />} />
          <Route path="/browse" element={user ? <Browse /> : <Navigate to="/" />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
