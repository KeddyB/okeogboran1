import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import crypto from "crypto"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXTPUBLICSANITYDATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.NEXTPUBLICSANITYTOKEN,
})

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    // Check if user already exists
    const existingUser = await client.fetch(`*[_type == "user" && email == $email][0]`, { email })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create new user
    await client.create({
      _type: "user",
      name,
      email,
      password: hashedPassword,
      hasPaid: false,
      isVerified: false,
      verificationToken,
    })

    // Send verification email
    const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify Your Email",
      html: `
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    })

    return NextResponse.json({
      message: "User registered successfully. Please check your email for the verification link.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "An unexpected error occurred during registration" }, { status: 500 })
  }
}

