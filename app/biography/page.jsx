"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { BiographyCard } from "@/components/biography-card"
import { fetchBiographies } from "@/lib/api"

export default function BiographyPage() {
  const [biographies, setBiographies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/auth/user-status")
          const data = await res.json()

          if (!data.isVerified) {
            router.push("/verify-email")
          } else if (!data.hasPaid) {
            router.push("/payment")
          } else {
            loadBiographies()
          }
        } catch (error) {
          console.error("Error checking user status:", error)
          router.push("/login")
        }
      } else if (status === "unauthenticated") {
        router.push("/login")
      }
    }

    checkUserStatus()
  }, [status, router])

  const loadBiographies = async () => {
    try {
      const bios = await fetchBiographies()
      setBiographies(bios)
    } catch (error) {
      console.error("Error fetching biographies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <FancyLoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Biographies of Okeogboran</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {biographies.map((bio) => (
            <BiographyCard key={bio._id} biography={bio} />
          ))}
        </div>
      </div>
    </div>
  )
}

