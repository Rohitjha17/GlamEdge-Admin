"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { 
  Grid3X3, 
  Layers, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  Menu,
  X
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { 
      title: "Dashboard", 
      icon: Grid3X3, 
      href: "/dashboard", 
      color: "from-pink-500 to-purple-600"
    },
    { 
      title: "Main Categories", 
      icon: Grid3X3, 
      href: "/dashboard/main-categories", 
      color: "from-purple-500 to-indigo-600"
    },
    { 
      title: "Sub Categories", 
      icon: Layers, 
      href: "/dashboard/sub-categories", 
      color: "from-indigo-500 to-blue-600"
    },
    { 
      title: "Services", 
      icon: Package, 
      href: "/dashboard/services", 
      color: "from-blue-500 to-cyan-600"
    },
    { 
      title: "Users", 
      icon: Users, 
      href: "/dashboard/users", 
      color: "from-cyan-500 to-teal-600"
    },
    { 
      title: "Orders", 
      icon: ShoppingCart, 
      href: "/dashboard/orders", 
      color: "from-teal-500 to-green-600"
    },
    { 
      title: "Settings", 
      icon: Settings, 
      href: "/dashboard/settings", 
      color: "from-green-500 to-emerald-600"
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-sm border-r border-pink-100 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:relative md:z-auto
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-pink-100">
            <Logo size="lg" variant="default" />
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link key={item.title} href={item.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-3 h-12 hover:bg-pink-50"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">{item.title}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-pink-100">
            <div className="text-center text-xs text-gray-500">
              <p className="font-medium">Crafted with Care</p>
              <p>by Saheda</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
