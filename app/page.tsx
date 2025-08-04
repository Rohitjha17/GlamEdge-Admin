"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { Logo } from "@/components/ui/logo"

const ADMIN_PHONES = ["9999999999"];

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await authApi.login(phoneNumber)
      console.log("🔐 OTP Response:", response)
      console.log("📱 Full response object:", JSON.stringify(response, null, 2))

      // Extract OTP from the response (handle nested structure)
      const otpFromResponse = response.otp || response.data?.otp
      console.log("📱 Extracted OTP:", otpFromResponse)

      // Only auto-verify for admin phone numbers
      if (otpFromResponse && ADMIN_PHONES.includes(phoneNumber)) {
        console.log("📱 OTP for testing:", otpFromResponse)
        console.log("⏰ Auto-verifying in 3 seconds...")

        // Auto-verify after 3 seconds for development
        setTimeout(() => {
          setOtp(otpFromResponse)
          setTimeout(() => {
            handleAutoVerify(otpFromResponse)
          }, 500)
        }, 3000)
      } else if (ADMIN_PHONES.includes(phoneNumber)) {
        console.log("⚠️ No OTP in response for admin phone. Using fallback OTP: 123456")
        console.log("⏰ Auto-verifying with fallback OTP in 3 seconds...")
        
        setTimeout(() => {
          setOtp("123456")
          setTimeout(() => {
            handleAutoVerify("123456")
          }, 500)
        }, 3000)
      }

      setStep("otp")
    } catch (error: any) {
      setError(error.message || "Failed to send OTP")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoVerify = async (autoOTP: string) => {
    setLoading(true)
    setError("")

    try {
      console.log("🔄 Auto-verifying OTP:", autoOTP)
      const response = await authApi.verifyLogin(phoneNumber, autoOTP)
      console.log("✅ Verification response:", JSON.stringify(response, null, 2))

      // Extract data from nested response structure
      const token = response.token || response.data?.token
      const user = response.user || response.data?.user

      // Store auth data
      localStorage.setItem("authToken", token)
      localStorage.setItem("userRole", user?.role || "user")
      localStorage.setItem("userPhone", phoneNumber)
      localStorage.setItem("userId", user?.id || "")

      console.log("✅ Login successful! User role:", user?.role)

      // Redirect based on role
      if (user?.role === "admin") {
        router.push("/dashboard")
      } else {
        // Redirect regular users to a different page or show message
        alert("This is an admin-only interface. Please contact support if you need admin access.")
      }
    } catch (error: any) {
      setError(error.message || "Auto-verification failed")
      console.error("Auto-verify error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("🔄 Manual OTP verification:", otp)
      const response = await authApi.verifyLogin(phoneNumber, otp)
      console.log("✅ Manual verification response:", JSON.stringify(response, null, 2))

      // Extract data from nested response structure
      const token = response.token || response.data?.token
      const user = response.user || response.data?.user

      // Store auth data
      localStorage.setItem("authToken", token)
      localStorage.setItem("userRole", user?.role || "user")
      localStorage.setItem("userPhone", phoneNumber)
      localStorage.setItem("userId", user?.id || "")

      console.log("✅ Manual login successful! User role:", user?.role)

      // Redirect based on role
      if (user?.role === "admin") {
        router.push("/dashboard")
      } else {
        setError("This is an admin-only interface. Please contact support if you need admin access.")
      }
    } catch (error: any) {
      setError(error.message || "Invalid OTP")
      console.error("Verify error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Logo size="xl" variant="full" />
          </div>
          <CardDescription>
            {step === "phone" ? "Enter your phone number to login" : "Enter the OTP sent to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOTP}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div className="text-center text-sm text-gray-600 mb-4">
                {ADMIN_PHONES.includes(phoneNumber) ? (
                  <>
                    <p>🔍 Check console for OTP (admin mode)</p>
                    <p>⏰ Auto-verifying in a few seconds...</p>
                  </>
                ) : (
                  <p>Enter the OTP sent to your phone</p>
                )}
              </div>
              <Button
                onClick={handleVerifyOTP}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button variant="outline" onClick={() => setStep("phone")} className="w-full">
                Back to Phone Number
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
