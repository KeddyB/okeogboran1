"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FancyLoadingScreen } from "@/components/fancy-loading-screen"
import { ContactForm } from "@/components/contact-form"
import { fetchAdvertisements } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Footer } from "../components/footer"

export default function AdvertisementPage() {
  const [ads, setAds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [formattedDates, setFormattedDates] = useState({})
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
            loadAds()
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

  const loadAds = async () => {
    try {
      const advertisements = await fetchAdvertisements()
      setAds(advertisements)
    } catch (error) {
      console.error("Error fetching advertisements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const dates = {}
    ads.forEach((ad) => {
      dates[ad._id] = formatDate(ad.startDate)
    })
    setFormattedDates(dates)
  }, [ads])

  if (isLoading) {
    return <FancyLoadingScreen />
  }

  const featuredAd = ads[0]
  const otherAds = ads.slice(1)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <nav className="mb-8 border-b border-border">
          <div className="flex items-center justify-between pb-4">
            <h1 className="text-4xl font-bold tracking-tighter">Advertisements</h1>
            <button
              onClick={() => router.push("/contact")}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Place Your Ad
            </button>
          </div>
        </nav>

        {ads.length > 0 ? (
          <div className="grid grid-cols-12 gap-8">
            {/* Featured Advertisement */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              {featuredAd && (
                <Link href={`/advertisement/${featuredAd.slug.current}`}>
                  <article className="group">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-4">
                      <Image
                        src={featuredAd.image || "/placeholder.svg"}
                        alt={featuredAd.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                      {featuredAd.title}
                    </h2>
                    {featuredAd.description && (
                      <p className="text-xl text-muted-foreground mb-4">{featuredAd.description}</p>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <time dateTime={featuredAd.startDate}>
                        {formattedDates[featuredAd._id] || featuredAd.startDate}
                      </time>
                    </div>
                  </article>
                </Link>
              )}

              {/* Other Advertisements Grid */}
              <div className="grid sm:grid-cols-2 gap-8 mt-12">
                {otherAds.map((ad) => (
                  <div key={ad._id}>
                    <Link href={`/advertisement/${ad.slug.current}`}>
                      <article className="group">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-lg mb-4">
                          <Image
                            src={ad.image || "/placeholder.svg"}
                            alt={ad.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                          {ad.title}
                        </h3>
                        {ad.description && <p className="text-muted-foreground line-clamp-2 mb-2">{ad.description}</p>}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <time dateTime={ad.startDate}>{formattedDates[ad._id] || ad.startDate}</time>
                        </div>
                      </article>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="sticky top-8">
                <h4 className="text-lg font-semibold mb-4">Latest Advertisements</h4>
                <div className="space-y-6">
                  {ads.slice(0, 5).map((ad) => (
                    <Link key={ad._id} href={`/advertisement/${ad.slug.current}`}>
                      <article className="group grid grid-cols-[80px,1fr] gap-4">
                        <div className="relative aspect-square overflow-hidden rounded">
                          <Image src={ad.image || "/placeholder.svg"} alt={ad.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h5 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {ad.title}
                          </h5>
                          <time className="text-sm text-muted-foreground" dateTime={ad.startDate}>
                            {formattedDates[ad._id] || ad.startDate}
                          </time>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-lg mb-8">
              There are currently no active advertisements. Interested in advertising with us?
            </p>
            <ContactForm />
          </div>
        )}
      </div>
      <Footer /> 
    </div>
  )
}

