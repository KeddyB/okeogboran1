import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { amount, email, name } = await req.json()

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: `tx-${Date.now()}`,
        amount,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
        customer: {
          email,
          name,
        },
        customizations: {
          title: "Okeogboran Payment",
          description: "Payment for access to Okeogboran",
          logo: "https://yourdomain.com/logo.png",
        },
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({ paymentLink: data.data.link })
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ message: "Error initializing payment" }, { status: 500 })
  }
}

