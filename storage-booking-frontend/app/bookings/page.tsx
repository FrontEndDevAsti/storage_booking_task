"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

interface Booking {
  id: number
  userName: string
  unitId: number
  unitName: string
  unitSize: string
  unitLocation: string
  pricePerDay: number
  startDate: string
  endDate: string
  totalCost: number
  status: string
}

function BookingsContent() {
  const searchParams = useSearchParams()
  const initialUserName = searchParams.get("userName") || ""

  const [bookings, setBookings] = useState<Booking[]>([])
  const [userName, setUserName] = useState(initialUserName)
  const [searchUserName, setSearchUserName] = useState(initialUserName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (initialUserName) {
      fetchBookings(initialUserName)
    }
  }, [initialUserName])

  const fetchBookings = async (user: string) => {
    if (!user.trim()) {
      setError("Please enter a username to view bookings")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/bookings?userName=${encodeURIComponent(user.trim())}`)
      const data = await response.json()

      if (response.ok) {
        setBookings(data)
        setUserName(user.trim())
      } else {
        setError(data.error || "Failed to fetch bookings")
        setBookings([])
      }
    } catch (error) {
      setError("Network error. Please try again.")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBookings(searchUserName)
  }

  const clearSearch = () => {
    setSearchUserName("")
    setUserName("")
    setBookings([])
    setError("")
  }

  const getBookingStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return "upcoming"
    if (now > end) return "completed"
    return "active"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookings</h1>
        <p className="text-gray-600">View and manage your storage unit reservations</p>
      </div>

      {/* Search Form */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Your Bookings</h2>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchUserName}
              onChange={(e) => setSearchUserName(e.target.value)}
              placeholder="Enter your full name"
              className="form-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center">
                <div className="loading-spinner mr-2" style={{ width: "20px", height: "20px" }}></div>
                Searching...
              </span>
            ) : (
              "Search Bookings"
            )}
          </button>
          {userName && (
            <button type="button" onClick={clearSearch} className="btn-secondary">
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Results */}
      {userName && !loading && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bookings for {userName}</h2>
          <p className="text-gray-600">
            {bookings.length === 0
              ? "No bookings found"
              : `Found ${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const status = getBookingStatus(booking.startDate, booking.endDate)
            const days = calculateDays(booking.startDate, booking.endDate)

            return (
              <div key={booking.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{booking.unitName}</h3>
                    <p className="text-gray-600">Booking #{booking.id}</p>
                  </div>
                  <span className={`badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{booking.unitSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{booking.unitLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatDate(booking.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{formatDate(booking.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-medium">${booking.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600 font-semibold">Total Cost:</span>
                    <span className="font-bold text-red-600">${booking.totalCost}</span>
                  </div>
                </div>

                {status === "active" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-600 font-medium text-sm">
                      ✅ Your unit is currently active and accessible
                    </p>
                  </div>
                )}

                {status === "upcoming" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-600 font-medium text-sm">
                      📅 Your booking starts on {formatDate(booking.startDate)}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Empty States */}
      {userName && bookings.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">You don't have any storage unit bookings yet.</p>
          <a href="/" className="btn-primary">
            Browse Available Units
          </a>
        </div>
      )}

      {!userName && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Bookings</h3>
          <p className="text-gray-600">Enter your name above to view your storage unit bookings</p>
        </div>
      )}
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading-spinner"></div>
          <p className="ml-4 text-gray-600 font-medium">Loading...</p>
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  )
}
