'use client'

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { User, LogOut, Megaphone } from 'lucide-react'
import Link from 'next/link'

export function AuthHeader() {
  const { data: session } = useSession()

  return (
    <header className="bg-primary text-primary-foreground p-2 flex justify-between items-center">
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-xl font-bold md:text-2xl">Okeogboran</span>
      </Link>
      <div className="flex items-center space-x-4">
        {session && (
          <>
            <Link href="/advertisement">
              <Button>
                <Megaphone className="h-3 w-3 md:h-5 md:w-5" />
              </Button>
            </Link>
            <Link href="/account">
              <Button>
                <User className="h-3 w-3 md:h-5 md:w-5" />
              </Button>
            </Link>
            <Button onClick={() => signOut()} variant="outline">
              <LogOut className="h-3 w-3 md:h-5 md:w-5" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}