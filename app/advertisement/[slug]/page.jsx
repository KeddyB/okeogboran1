"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { fetchAdvertisementBySlug } from "@/lib/api"
import { ArrowLeft, ExternalLink } from "lucide-react"
import PortableText from "@/components/PortableText"
import { Footer } from "@/app/components/footer"

export default function AdvertisementDetail({ params: paramsPromise }) {
  const params = React.use(paramsPromise)
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
  }, [status, router])

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
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/advertisement"
            className="inline-flex items-center text-primary hover:text-primary/90 transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to advertisements
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Advertisement not found</h1>
            <p className="text-muted-foreground">The advertisement you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/advertisement"
          className="inline-flex items-center text-primary hover:text-primary/90 transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to advertisements
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{ad.title}</h1>
          {ad.description && <p className="text-xl text-muted-foreground mb-4">{ad.description}</p>}
          <time className="text-sm text-muted-foreground" dateTime={ad.startDate}>
            {new Date(ad.startDate).toLocaleDateString()}
          </time>
        </header>

        {ad.image && (
          <div className="relative aspect-video overflow-hidden rounded-xl mb-8">
            <Image src={ad.image || "/placeholder.svg"} alt={ad.title} fill className="object-cover" />
          </div>
        )}

        {ad.content && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <PortableText value={ad.content} />
          </div>
        )}

        {ad.link && (
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Learn More
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        )}
      </article>
      <Footer /> 
    </div>
  )
}

