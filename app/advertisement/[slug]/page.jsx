"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { fetchAdvertisementBySlug } from "@/lib/api"

export default function AdvertisementDetail({ params }) {
  const [ad, setAd] = useState(null)
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
            loadAd()
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
  }, [status, router]) // Removed params.slug from dependencies

  const loadAd = async () => {
    try {
      const advertisement = await fetchAdvertisementBySlug(params.slug)
      setAd(advertisement)
    } catch (error) {
      console.error("Error fetching advertisement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <FancyLoadingScreen />
  }

  if (!ad) {
    return <div className="container mx-auto px-4 py-8">Advertisement not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/advertisement" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to all advertisements
      </Link>
      <article className="bg-card shadow-lg rounded-lg overflow-hidden">
        {ad.image && (
          <div className="relative h-64 md:h-96">
            <Image src={ad.image || "/placeholder.svg"} alt={ad.title} layout="fill" objectFit="cover" />
          </div>
        )}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
          {ad.description && <p className="text-xl text-gray-600 mb-6">{ad.description}</p>}
          {ad.content && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: ad.content }} />}
          {ad.link && (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors mt-8"
            >
              Learn More
            </a>
          )}
        </div>
      </article>
    </div>
  )
}

