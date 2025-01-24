import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  try {
    const user = await client.fetch(
      `*[_type == "user" && confirmationToken == $token][0]`,
      { token }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await client
      .patch(user._id)
      .set({ isConfirmed: true, confirmationToken: null })
      .commit();

    return NextResponse.json({ message: "Email confirmed successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ?
    error.message : "Unknown Message"
    return NextResponse.json(
      { message: `Error confirming email: ${errorMessage}` },
      { status: 500 }
    );
  }
}
