import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/auth.config"

export async function POST() {
  try {
    // Check if required environment variables are set
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error("FLUTTERWAVE_SECRET_KEY is not configured")
    }

    if (!process.env.NEXTAUTH_URL) {
      throw new Error("NEXTAUTH_URL is not configured")
    }

    const session = await getServerSession(authConfig)
    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json({ message: "Unauthorized or incomplete user data" }, { status: 401 })
    }

    // Generate unique transaction reference
    const tx_ref = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Initialize Flutterwave payment
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref,
        amount: 1000,
        currency: "NGN",
        redirect_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
        payment_options: "card,banktransfer,ussd",
        customer: {
          email: session.user.email,
          name: session.user.name,
          phonenumber: "N/A", // Optional, but some payment methods might require it
        },
        customizations: {
          title: "Okeogboran Premium Access",
          description: "Full access to Okeogboran content",
          logo: `${process.env.NEXTAUTH_URL}/oke.png`,
        },
        meta: {
          user_id: session.user.id,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Flutterwave API error:", errorData)
      throw new Error(errorData.message || "Failed to initialize payment")
    }

    const data = await response.json()

    // Store transaction reference in session or database if needed
    // This is optional but can be useful for verification later

    return NextResponse.json(data)
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      {
        message: "Error initializing payment",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

