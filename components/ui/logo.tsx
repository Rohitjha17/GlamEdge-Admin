import { Sparkles } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showTagline?: boolean
  className?: string
  variant?: "default" | "simple" | "full"
}

export function Logo({ 
  size = "md", 
  showTagline = true, 
  className = "",
  variant = "default"
}: LogoProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg", 
    lg: "text-xl",
    xl: "text-2xl"
  }

  if (variant === "simple") {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-lg">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="ml-2 font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Glam Edge
        </span>
      </div>
    )
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="flex items-center mb-1">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <div className={`font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent ${sizeClasses[size]}`}>
              <span className="font-serif">glam</span>
              <span className="font-script ml-1">edge</span>
            </div>
          </div>
        </div>
        {showTagline && (
          <div className="text-xs text-gray-500 font-medium tracking-wide">
            CRAFTED WITH CARE BY SAHEDA
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl shadow-lg">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <div className="ml-3">
        <div className={`font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent ${sizeClasses[size]}`}>
          <span className="font-serif">glam</span>
          <span className="font-script ml-1">edge</span>
        </div>
        {showTagline && (
          <div className="text-xs text-gray-500 mt-1 font-medium">
            CRAFTED WITH CARE
          </div>
        )}
      </div>
    </div>
  )
} 