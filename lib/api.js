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

export async function fetchBiographies() {
  try {
    const bios = await client.fetch(`*[_type == "biography"]{
      _id,
      name,
      slug,
      "image": image.asset->url
    }`)
    return bios
  } catch (error) {
    console.error("Error fetching biographies:", error.message, error)
    return []
  }
}

export async function fetchBiographyBySlug(slug) {
  try {
    const bio = await client.fetch(
      `*[_type == "biography" && slug.current == $slug][0]{
        _id,
        name,
        "slug": slug.current,
        "image": image.asset->url,
        content
      }`,
      { slug },
    )
    return bio
  } catch (error) {
    console.error("Error fetching biography:", error.message, error)
    return null
  }
}
export async function fetchVideo() {
  try {
    const video = await client.fetch(
      `*[_type == "video"][0]{
        myVideoField {
          asset-> {
          playbackId,
          assetId,
          filename,
        }
      }
      }`,
    )
    return video
  } catch (error) {
    console.error("Error fetching biography:", error.message, error)
    return null
  }
}
