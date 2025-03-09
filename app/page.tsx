"use client"

// import { useSession } from "next-auth/react"
import { Header } from "./components/header"
import { MainContent } from "./components/main-content"
import { Footer } from "./components/footer"

export default function Home() {
  // const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MainContent />
      </div>
      <Footer />
    </div>
  )
}

