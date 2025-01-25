"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"

export default function VerifyEmailPage() {
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const verifyEmail = async (verificationToken) => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: verificationToken }),
        })
        const data = await res.json()
        if (res.ok) {
          setMessage(data.message)
          setTimeout(() => router.push("/login"), 2000)
        } else {
          setError(data.message || "Verification failed")
        }
      } catch (_error) {
        setError("An error occurred. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      verifyEmail(token)
    } else {
      setIsLoading(false)
    }
  }, [router, token])

  if (isLoading) {
    return <FancyLoadingScreen />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-8 py-6 mt-4 text-left bg-card shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-foreground">Verify Your Email</h3>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
        {!token && (
          <>
            <p className="mt-4 text-center">No verification token found. Please use the link from your email.</p>
            <Button onClick={() => router.push("/login")} className="w-full mt-4">
              Return to Login
            </Button>
          </>
        )}
        {token && !error && !message && <p className="mt-4 text-center">Verifying your email...</p>}
      </div>
    </div>
  )
}