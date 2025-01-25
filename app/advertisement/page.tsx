"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@sanity/client"
import { useSession } from "next-auth/react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXTPUBLICSANITYDATASET,
  apiVersion: "2024-01-01",
  useCdn: true,
  token: process.env.NEXTPUBLICSANITYTOKEN,
})

interface Advertisement {
  _id: string
  title: string
  description?: string
  image: {
    asset: {
      _ref: string
    }
  }
  link?: string
}

export default function AdvertisementPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { status } = useSession()
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
            fetchAds()
          }
        } catch (error) {
          console.error("Error checking user status:", error)
          router.push("/login")
        }
      } else if (status === "unauthenticated") {
        router.push("/login")
      }
      setIsLoading(false)
    }

    checkUserStatus()
  }, [status, router])

  const fetchAds = async () => {
    const query = `*[_type == "advertisement" && isActive == true && startDate <= $now && endDate >= $now]`
    const params = { now: new Date().toISOString() }
    const result = await client.fetch(query, params)
    setAds(result)
    setIsLoading(false)
  }

  if (isLoading) {
    return <FancyLoadingScreen />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Advertisements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ads.map((ad) => (
          <div key={ad._id} className="bg-card shadow-lg rounded-lg overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2">{ad.title}</h3>
              {ad.description && <p className="text-sm mb-4">{ad.description}</p>}
              {ad.image && (
                <div className="relative h-48 mb-4">
                  <Image
                    src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXTPUBLICSANITYDATASET}/${ad.image.asset._ref.replace("image-", "").replace("-jpg", ".jpg")}`}
                    alt={ad.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              {ad.link && (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                >
                  Learn More
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

