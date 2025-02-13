"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Megaphone, Book, Menu } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function AuthHeader() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: "/advertisement", icon: Megaphone, label: "Advertisements" },
    { href: "/biography", icon: Book, label: "Biographies" },
  ]

  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-xl sm:text-2xl font-bold">Okeogboran</span>
      </Link>
      {session && (
        <div className="flex items-center space-x-4">
          <Link href="/account">
            <Avatar>
              <AvatarImage src={session.user.image} alt={session.user.name} />
              <AvatarFallback>{session.user.name ? session.user.name[0].toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="hidden md:flex space-x-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="icon">
                  <item.icon className="h-5 w-5" />
                </Button>
              </Link>
            ))}
            <Button onClick={() => signOut()} variant="outline" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn(
                  "z-50 min-w-[10rem] overflow-hidden rounded-md border p-1 text-primary-foreground shadow-md bg-primary",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                )}
              >
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-sm px-2 py-1.5 text-md w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="text-primary-foreground">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </header>
  )
}

