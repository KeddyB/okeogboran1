import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      hasPaid: boolean
      isVerified: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    hasPaid: boolean,
    isVerified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    hasPaid: boolean
    isVerified: boolean
  }
}