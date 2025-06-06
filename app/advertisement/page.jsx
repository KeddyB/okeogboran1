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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Latest Advertisements
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Discover the latest opportunities and announcements in Okeogboran
              </p>
            </div>
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
            >
              Place Your Ad
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {ads.length > 0 ? (
          <div className="space-y-12">
            {/* Featured Advertisement */}
            {featuredAd && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <Link href={`/advertisement/${featuredAd.slug.current}`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-[21/9] overflow-hidden">
                      <Image
                        src={featuredAd.image || "/placeholder.svg"}
                        alt={featuredAd.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <span className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded-full mb-4">
                          Featured
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                          {featuredAd.title}
                        </h2>
                        {featuredAd.description && (
                          <p className="text-lg text-gray-200 line-clamp-2">
                            {featuredAd.description}
                          </p>
                        )}
                        <div className="mt-4 text-sm text-gray-300">
                          <time dateTime={featuredAd.startDate}>
                            {formattedDates[featuredAd._id] || featuredAd.startDate}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Other Advertisements Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherAds.map((ad) => (
                <Link key={ad._id} href={`/advertisement/${ad.slug.current}`}>
                  <article className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={ad.image || "/placeholder.svg"}
                        alt={ad.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2">
                        {ad.title}
                      </h3>
                      {ad.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <time dateTime={ad.startDate}>
                          {formattedDates[ad._id] || ad.startDate}
                        </time>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No Active Advertisements
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                There are currently no active advertisements. Would you like to be the first to advertise with us?
              </p>
              <ContactForm />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

