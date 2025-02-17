"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { fetchBiographyBySlug } from "@/lib/api"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import PortableText from "@/components/PortableText"

export default function BiographyDetailPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise)
  const [biography, setBiography] = useState(null)
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
            loadBiography()
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

  const loadBiography = async () => {
    try {
      const bio = await fetchBiographyBySlug(params.slug)
      setBiography(bio)
    } catch (error) {
      console.error("Error fetching biography:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <FancyLoadingScreen />
  }

  if (!biography) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/biography"
            className="inline-flex items-center text-primary hover:text-primary/90 transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to biographies
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Biography not found</h1>
            <p className="text-muted-foreground">The biography you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/biography"
          className="inline-flex items-center text-primary hover:text-primary/90 transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to biographies
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Biography of {biography.name}</h1>
        </header>

        {biography.image && (
          <div className="relative aspect-video overflow-hidden rounded-xl mb-8">
            <Image src={biography.image || "/placeholder.svg"} alt={biography.name} layout="fill" objectFit="cover" />
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none mb-8">
          <PortableText value={biography.content} className="text-2xl text-justify" />
        </div>
      </article>
    </div>
  )
}

