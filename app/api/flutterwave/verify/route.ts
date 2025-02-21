import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXTPUBLICSANITYDATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.NEXTPUBLICSANITYTOKEN,
})

interface VerifyRequestBody {
  transaction_id: string
  tx_ref: string
  userId: string
}

export async function POST(req: Request) {
  try {
    const { transaction_id, userId }: VerifyRequestBody = await req.json()

    // Verify the transaction with Flutterwave
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.status === "success" && data.data.status === "successful") {
      // Update user payment status in Sanity
      await client.patch(userId).set({ hasPaid: true }).commit()

      return NextResponse.json({ status: "success" })
    } else {
      return NextResponse.json({ status: "failed", message: "Payment verification failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ status: "error", message: "Error verifying payment" }, { status: 500 })
  }
}

