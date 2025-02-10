import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req) {
  const { name, email, message } = await req.json()

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: "New Advertising Inquiry",
      html: `
        <h1>New Advertising Inquiry</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    return NextResponse.json({ message: "Message sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ message: "Error sending message" }, { status: 500 })
  }
}

