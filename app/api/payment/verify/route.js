import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/auth.config"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXTPUBLICSANITYDATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.NEXTPUBLICSANITYTOKEN,
})

export async function POST(req) {
  try {
    // Check required environment variables
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error("FLUTTERWAVE_SECRET_KEY is not configured")
    }

    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { transaction_id, tx_ref } = await req.json()

    if (!transaction_id && !tx_ref) {
      return NextResponse.json({ message: "Transaction reference not provided" }, { status: 400 })
    }

    // Verify payment with Flutterwave
    const verifyUrl = transaction_id
      ? `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`

    const response = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Flutterwave verification failed:", await response.text())
      throw new Error("Payment verification failed")
    }

    const data = await response.json()

    console.log(data)

    // Check if the payment was successful
    if (data.status !== "success" || data.data.status !== "successful") {
      return NextResponse.json({ message: "Payment was not successful" }, { status: 400 })
    }

    // Verify amount and currency
    if (data.data.amount !== 1000 || data.data.currency !== "NGN") {
      return NextResponse.json({ message: "Invalid payment amount or currency" }, { status: 400 })
    }

    // Update user payment status in Sanity
    await client
      .patch(session.user.id)
      .set({
        hasPaid: true,
        paymentReference: transaction_id || tx_ref,
        paymentDate: new Date().toISOString(),
        paymentAmount: data.data.amount,
        paymentCurrency: data.data.currency,
      })
      .commit()

    return NextResponse.json({
      message: "Payment verified successfully",
      status: "success",
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        message: "Error verifying payment",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

