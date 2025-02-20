"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"

export default function VerifyPaymentPage() {
  const [message, setMessage] = useState("Verifying payment...")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update: updateSession } = useSession()

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get transaction details from URL parameters
        const status = searchParams.get("status")
        const tx_ref = searchParams.get("tx_ref")
        const transaction_id = searchParams.get("transaction_id")

        if (!status || (!tx_ref && !transaction_id)) {
          setMessage("Invalid payment verification parameters")
          setTimeout(() => router.push("/payment"), 2000)
          return
        }

        // If payment was not successful, redirect back to payment page
        if (status !== "successful") {
          setMessage("Payment was not successful. Redirecting...")
          setTimeout(() => router.push("/payment"), 2000)
          return
        }

        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            tx_ref,
            transaction_id,
          }),
        })

        const data = await res.json()

        if (res.ok) {
          // Update session with new payment status
          await updateSession({ hasPaid: true })
          setMessage("Payment verified successfully! Redirecting...")
          setTimeout(() => router.push("/"), 2000)
        } else {
          throw new Error(data.message || "Payment verification failed")
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setMessage("Error verifying payment. Please contact support.")
        setTimeout(() => router.push("/payment"), 2000)
      }
    }

    verifyPayment()
  }, [searchParams, router, updateSession])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <FancyLoadingScreen />
        <p className="mt-4 text-lg text-foreground">{message}</p>
        <button onClick={() => router.push("/payment")} className="mt-4 text-sm text-primary hover:underline">
          Return to payment page
        </button>
      </div>
    </div>
  )
}

