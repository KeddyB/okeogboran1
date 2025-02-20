"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { Shield } from "lucide-react"

export default function PaymentPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.hasPaid) {
      router.push("/")
    }
  }, [session, status, router])

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      setError("")
      setMessage("")

      if (!session?.user?.id) {
        throw new Error("User ID not found")
      }

      // Dynamically load Flutterwave script
      const script = document.createElement("script")
      script.src = "https://checkout.flutterwave.com/v3.js"
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        FlutterwaveCheckout({
          public_key: "YOUR_PUBLIC_KEY",
          tx_ref: `TX-${Date.now()}`,
          amount: 1000, // Change this to the actual amount
          currency: "NGN",
          payment_options: "card, mobilemoney, ussd",
          customer: {
            email: session.user.email,
            name: session.user.name,
          },
          callback: async (data) => {
            if (data.status === "successful") {
              setMessage("Payment successful!")
              await updateSession({ hasPaid: true })
              router.push("/")
            } else {
              setError("Payment failed. Please try again.")
            }
          },
          onclose: function () {
            setError("Payment was not completed.")
          },
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
      setError(error.message || "Error processing payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === "loading" || !session) {
    return <FancyLoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Get access to all content</h1>
        </div>

        <div className="max-w-sm mx-auto">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>Secure payment via Flutterwave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-4xl center font-semibold">₦1,000</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="p-4 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                    {message}
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay Now"}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment powered by Flutterwave</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
