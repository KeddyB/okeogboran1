"use client"

import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { CookieConsent } from "./components/cookie-consent"
import { ErrorBoundary } from "@/components/error-boundary"

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/verify-email", "/reset-password", "/forgot-password"]

function AuthWrapper({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [userChecked, setUserChecked] = useState(false)

  useEffect(() => {
    // Only run this effect when session status changes or pathname changes
    if (status === "loading") return

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    const checkUserStatus = async () => {
      setIsLoading(true)

      if (status === "authenticated") {
        try {
          const res = await fetch("/api/auth/user-status")
          const data = await res.json()

          // Store the result in sessionStorage to avoid repeated API calls
          sessionStorage.setItem("userStatus", JSON.stringify(data))

          if (!data.isVerified && pathname !== "/verify-email") {
            router.push("/verify-email")
          } else if (data.isVerified && !data.hasPaid && pathname !== "/payment") {
            router.push("/payment")
          } else if (data.hasPaid && pathname === "/payment") {
            router.push("/")
          }
        } catch (error) {
          console.error("Error checking user status:", error)
          if (!isPublicRoute) {
            router.push("/login")
          }
        } finally {
          setUserChecked(true)
          setIsLoading(false)
        }
      } else if (status === "unauthenticated" && !isPublicRoute) {
        router.push("/login")
        setUserChecked(true)
        setIsLoading(false)
      } else {
        setUserChecked(true)
        setIsLoading(false)
      }
    }

    checkUserStatus()
  }, [status, pathname, router])

  // Show loading screen only during initial check
  if ((status === "loading" || isLoading) && !userChecked) {
    return <FancyLoadingScreen />
  }

  return <>{children}</>
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Okeogboran - Discover the charm of our enchanting town" />
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <AuthWrapper>
                <LayoutWrapper>{children}</LayoutWrapper>
                <CookieConsent />
                <Toaster />
              </AuthWrapper>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

