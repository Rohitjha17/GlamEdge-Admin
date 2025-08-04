import { Logo } from "./logo"

export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Logo size="sm" variant="simple" />
            <div className="text-sm text-gray-500">
              <p>Admin Dashboard</p>
              <p className="text-xs">Manage your beauty services</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="text-center">
              <p className="font-medium">Crafted with Care</p>
              <p className="text-xs">by Saheda</p>
            </div>
            <div className="text-center">
              <p className="font-medium">© 2024</p>
              <p className="text-xs">Glam Edge</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 