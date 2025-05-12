"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, FileText, Home, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/payslips", label: "Payslips", icon: FileText },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Building className="h-5 w-5" />
          <span>Payroll System</span>
        </div>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
