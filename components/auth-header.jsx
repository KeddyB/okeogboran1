"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Megaphone, Book, Menu, User, Home } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function AuthHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/advertisement", icon: Megaphone, label: "Advertisements" },
    { href: "/biography", icon: Book, label: "Biographies" },
    { href: "/account", icon: User, label: "Account" },
  ]

  const isActive = (path) => pathname === path

  return (
    <header className="bg-primary/90 backdrop-blur-sm text-primary-foreground p-4 sticky top-0 z-40 w-full shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-bold">Okeogboran</span>
        </Link>
        {session && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-3 items-center">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
              <Button onClick={() => signOut()} variant="outline" size="sm" className="flex items-center gap-1">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
              <Link href="/account">
                <Avatar className="h-9 w-9 border-2 border-primary-foreground hover:border-secondary transition-colors">
                  <AvatarImage src={session.user.image} alt={session.user.name} />
                  <AvatarFallback>{session.user.name ? session.user.name[0].toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <Link href="/account">
                <Avatar className="h-8 w-8 mr-4">
                  <AvatarImage src={session.user.image} alt={session.user.name} />
                  <AvatarFallback>{session.user.name ? session.user.name[0].toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="items-center justify-center">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-border/40 p-1 shadow-md bg-background/80 backdrop-blur-md"
                >
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm",
                          isActive(item.href)
                            ? "bg-accent/80 text-accent-foreground"
                            : "text-foreground hover:text-primary hover:bg-accent/60",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-foreground hover:text-primary hover:bg-accent/60"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

