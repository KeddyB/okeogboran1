"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FaGoogle } from "react-icons/fa"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    return regex.test(password)
  }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return ""
    if (password.length < 6) return "Weak"
    if (validatePassword(password)) return "Strong"
    return "Medium"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (isLogin) {
      setIsLoggingIn(true)
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })
      if (result?.error) {
        if (result.error === "User not verified") {
          setError("Please verify your email before logging in.")
        } else {
          setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error)
        }
      } else {
        router.push("/payment")
      }
      setIsLoggingIn(false)
    } else {
      setIsRegistering(true)
      if (password !== confirmPassword) {
        setError("Passwords don't match")
        setIsRegistering(false)
        return
      }
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (res.ok) {
          setMessage("Account created successfully. Please check your email for verification.")
          setIsLogin(true)
        } else {
          setError(data.message || "Registration failed")
        }
      } catch (error) {
        setError("An error occurred during registration. Please try again.")
        console.error("Registration error:", error)
      } finally {
        setIsRegistering(false)
      }
    }
  }

  const handleGoogleSignIn = () => {
    setIsGoogleSigningIn(true)
    signIn("google", { callbackUrl: "/payment" }).catch((error) => {
      console.error("Google sign-in error:", error)
      setIsGoogleSigningIn(false)
    })
  }

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/payment")
    }
  }, [status, router])

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-6">{isLogin ? "Welcome Back 👋" : "Welcome 👋"}</h1>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
            
            <div>
              <input
                type="email"
                placeholder="Example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {!isLogin && (
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-blue-600 text-sm hover:underline">
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isRegistering || isLoggingIn}
              className="w-full bg-[#0F1A2E] text-white p-3 rounded-lg hover:bg-[#1a2942] transition-colors"
            >
              {isLogin ? (isLoggingIn ? "Signing in..." : "Sign in") : (isRegistering ? "Registering..." : "Register")}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn}
              className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-[#4285F4]" />
              <span className="text-gray-600">
                {isGoogleSigningIn ? "Signing in with Google..." : "Sign in with Google"}
              </span>
            </button>
          </div>

          <p className="mt-8 text-center text-gray-600">
            {isLogin ? "Don't you have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="mt-8 text-center text-gray-500 text-sm">
            © 2025 ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
      
    </div>
  )
}