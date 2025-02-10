import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.NEXTPUBLICSANITYTOKEN,
})

export async function fetchAdvertisements() {
  try {
    const ads = await client.fetch(`*[_type == "advertisement"]{
        title,
        description,
        "image": image.asset->url,
        link,
        isActive,
        slug,
      }`)
    return ads
  } catch (error) {
    console.error("Error fetching advertisements:", error.message, error)
    return []
  }
}

export async function fetchAdvertisementBySlug(slug) {
  try {
    const ad = await client.fetch(
      `*[_type == "advertisement" && slug.current == $slug][0]{
      title,
      description,
      "image": image.asset->url,
      link,
      isActive,
      content
    }`,
      { slug },
    )
    return ad
  } catch (error) {
    console.error("Error fetching advertisement:", error.message, error)
    return null
  }
}

