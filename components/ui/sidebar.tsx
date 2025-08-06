"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Grid3X3, 
  Layers, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  Menu,
  X,
  Home,
  TrendingUp
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { 
      title: "Dashboard", 
      icon: Home, 
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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const toggleMenu = () => {
    console.log("Menu button clicked, current state:", isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-20 left-4 z-[9999]">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMenu}
          className="bg-white shadow-lg border-pink-200 hover:bg-pink-50"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:relative md:z-auto md:top-0 md:h-screen md:shadow-none md:border-r-0">
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-pink-100 z-[9999] shadow-lg">
          <div className="flex flex-col h-full">
            {/* Navigation Menu */}
            <nav className="flex-1 p-4 sm:p-6 space-y-2 sm:space-y-3">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.title} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start space-x-3 sm:space-x-4 h-12 sm:h-14 text-sm sm:text-base transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                          : 'hover:bg-pink-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                        isActive 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-r ${item.color}`
                      }`}>
                        <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : 'text-white'}`} />
                      </div>
                      <span className={`text-sm sm:text-base ${isActive ? 'text-white font-medium' : ''}`}>
                        {item.title}
                      </span>
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Crafted with Care</p>
                <p className="text-xs sm:text-sm text-gray-500">by Saheda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-pink-100 z-[9999] shadow-lg overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Navigation Menu */}
            <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.title} href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start space-x-4 h-14 text-base transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                          : 'hover:bg-pink-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-r ${item.color}`
                      }`}>
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'}`} />
                      </div>
                      <span className={`text-base font-medium truncate ${isActive ? 'text-white' : 'text-gray-700'}`}>
                        {item.title}
                      </span>
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 flex-shrink-0">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Crafted with Care</p>
                <p className="text-sm text-gray-500">by Saheda</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="md:hidden fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs z-[10000]">
          Menu: {isOpen ? 'Open' : 'Closed'}
        </div>
      )}
    </>
  )
}
