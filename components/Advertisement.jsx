"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { fetchAdvertisements } from "@/lib/api"

export function Advertisement() {
  const [ad, setAd] = useState(null)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const ads = await fetchAdvertisements()
        if (ads.length > 0) {
          setAd(ads[0]) // Display the first advertisement
        }
      } catch (error) {
        console.error("Error fetching advertisement:", error)
      }
    }

    fetchAd()
  }, [])

  if (!ad) return null

  return (
    <div className="bg-card shadow-lg rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{ad.title}</h3>
        {ad.description && <p className="text-sm mb-4">{ad.description}</p>}
        {ad.image && (
          <div className="relative h-48 mb-4">
            <Image src={ad.image || "/placeholder.svg"} alt={ad.title} layout="fill" objectFit="cover" />
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
  )
}

