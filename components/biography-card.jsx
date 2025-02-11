import Image from "next/image"
import Link from "next/link"

export function BiographyCard({ biography }) {
  return (
    <Link href={`/biography/${biography.slug.current}`}>
      <div className="bg-card shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48">
          <Image src={biography.image || "/placeholder.svg"} alt={biography.name} layout="fill" objectFit="cover" />
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground">Biography of {biography.name}</h2>
        </div>
      </div>
    </Link>
  )
}

