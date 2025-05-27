import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Storage Booking System",
  description: "Book your storage unit today",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-poppins bg-gray-50 min-h-screen">
        <nav className="bg-white shadow-lg border-b-2 border-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-red-600">StorageHub</h1>
              </div>
              <div className="flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                  Browse Units
                </a>
                <a href="/bookings" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                  My Bookings
                </a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
