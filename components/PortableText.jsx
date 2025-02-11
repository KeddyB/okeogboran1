import Image from "next/image"
import { urlFor } from "@/lib/sanity"

const PortableText = ({ value }) => {
  if (!value) return null

  return value.map((block) => {
    if (block._type === "block") {
      return renderBlock(block)
    } else if (block._type === "image") {
      return renderImage(block)
    }
    return null
  })
}

const renderBlock = (block) => {
  const { style = "normal" } = block

  if (/^h\d/.test(style)) {
    const level = style.replace(/[^\d]/g, "")
    const Tag = `h${level}`
    return (
      <Tag key={block._key} className={`text-2xl font-bold my-4`}>
        {block.children.map(renderSpan)}
      </Tag>
    )
  }

  if (style === "blockquote") {
    return (
      <blockquote key={block._key} className="border-l-4 border-gray-300 pl-4 my-4 italic">
        {block.children.map(renderSpan)}
      </blockquote>
    )
  }

  return (
    <p key={block._key} className="my-4">
      {block.children.map(renderSpan)}
    </p>
  )
}

const renderSpan = (span, index) => {
  if (span.marks.includes("strong")) {
    return <strong key={index}>{span.text}</strong>
  }

  if (span.marks.includes("em")) {
    return <em key={index}>{span.text}</em>
  }

  if (span.marks.includes("code")) {
    return (
      <code key={index} className="bg-gray-100 rounded p-1">
        {span.text}
      </code>
    )
  }

  return span.text
}

const renderImage = (block) => {
  const { asset, alt = "", caption } = block
  return (
    <figure key={block._key} className="my-8">
      <Image
        src={urlFor(asset).url() || "/placeholder.svg"}
        alt={alt}
        width={800}
        height={600}
        layout="responsive"
        className="rounded-lg"
      />
      {caption && <figcaption className="text-center text-sm text-gray-500 mt-2">{caption}</figcaption>}
    </figure>
  )
}

export default PortableText

