"use client"

import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { CookieConsent } from "./components/cookie-consent"

function AuthWrapper({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const publicRoutes = ["/login", "/verify-email", "/payment", "/verify-payment"]
    const isPublicRoute = publicRoutes.includes(pathname)

    const checkUserStatus = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/auth/user-status")
          const data = await res.json()

          if (!data.isVerified && pathname !== "/verify-email") {
            router.push("/verify-email")
          } else if (!data.isVerified && !data.hasPaid && pathname === "/advertisement") {
            router.push("/verify-email")
          } else if (!data.hasPaid && pathname !== "/payment") {
            router.push("/payment")
          } else if (data.hasPaid && pathname === "/payment") {
            router.push("/")
          }
        } catch (error) {
          console.error("Error checking user status:", error)
          router.push("/login")
        }
      } else if (status === "unauthenticated" && !isPublicRoute) {
        router.push("/login")
      }
    }

    checkUserStatus()
  }, [status, router, pathname])

  if (status === "loading") {
    return <FancyLoadingScreen />
  }

  return <>{children}</>
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthWrapper>
              <LayoutWrapper>{children}</LayoutWrapper>
              <CookieConsent />
              <Toaster />
            </AuthWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

