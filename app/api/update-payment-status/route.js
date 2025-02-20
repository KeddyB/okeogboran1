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
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId, paymentReference } = await req.json()

    // Update user payment status in Sanity
    await client
      .patch(userId)
      .set({
        hasPaid: true,
        paymentReference,
        paymentDate: new Date().toISOString(),
      })
      .commit()

    return NextResponse.json({
      message: "Payment status updated successfully",
      hasPaid: true,
    })
  } catch (error) {
    console.error("Error updating payment status:", error)
    return NextResponse.json({ message: "Error updating payment status" }, { status: 500 })
  }
}

