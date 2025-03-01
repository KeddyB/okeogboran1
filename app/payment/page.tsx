"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard, Loader2 } from "lucide-react"
import Script from "next/script"
import type { FlutterwaveConfig, FlutterwaveResponse } from "@/types/flutterwave"

export default function PaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.hasPaid) {
      router.push("/")
    }
  }, [status, router, session])

  const handlePayment = () => {
    if (!session?.user) return

    setIsLoading(true)
    try {
      const config: FlutterwaveConfig = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
        tx_ref: `tx-${Date.now()}`,
        amount: 1000,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        meta: {
          userId: session.user.id,
        },
        customer: {
          email: session.user.email!,
          name: session.user.name!,
        },
        customizations: {
          title: "Okeogboran Payment",
          description: "Payment for access to Okeogboran",
          logo: "https://yourdomain.com/logo.png",
        },
        callback: async (response: FlutterwaveResponse) => {
          try {
            const verifyRes = await fetch("/api/flutterwave/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                mode: "no-cors",
              },
              body: JSON.stringify({
                transaction_id: response.transaction_id,
                tx_ref: response.tx_ref,
                userId: session.user.id,
              }),
            })

            const data = await verifyRes.json()
            if (data.status === "success") {
              setPaymentSuccess(true)
              setMessage("Payment successful!")
              // Sign out and redirect to login after 3 seconds
              setTimeout(async () => {
                await signOut({ redirect: false })
                router.push("/login?payment=success")
              }, 3000)
            } else {
              setMessage("Payment verification failed. Please contact support.")
            }
          } catch (error) {
            console.error("Verification error:", error)
            setMessage("Error verifying payment. Please contact support.")
          }
        },
        onclose: () => {
          setIsLoading(false)
        },
      }

      window.FlutterwaveCheckout(config)
    } catch (error) {
      console.error("Payment error:", error)
      setMessage("Error processing payment. Please try again.")
      setIsLoading(false)
    }
  }

  if (status === "loading" || !session) {
    return <FancyLoadingScreen />
  }

  return (
    <>
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        onLoad={() => setIsScriptLoaded(true)}
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {paymentSuccess ? "Payment Successful!" : "Complete Your Payment"}
            </CardTitle>
            <CardDescription className="text-center">
              {paymentSuccess
                ? "Thank you for your payment. You will be redirected to login."
                : "Access premium content with a one-time payment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center text-muted-foreground">
                  Your payment has been processed successfully. Please log in again to access your content.
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Premium Access</span>
                    <span className="font-bold">₦1000</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Full access to all content
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Exclusive features
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        One-time payment
                      </li>
                    </ul>
                  </div>
                </div>
                {message && (
                  <p
                    className={`text-sm text-center ${
                      message.includes("successful") ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!paymentSuccess && (
              <Button onClick={handlePayment} disabled={isLoading || !isScriptLoaded} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ₦1000
                  </>
                )}
              </Button>
            )}
          </CardFooter>
          <div>
            <p className="text-sm text-center text-muted-foreground p-4">
              Ignore if you already made payment. If you have any questions or need assistance, please contact support.
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}

