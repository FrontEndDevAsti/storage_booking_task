"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface StorageUnit {
  id: number
  name: string
  size: string
  location: string
  pricePerDay: number
  isAvailable: boolean
  description?: string
}

function BookingForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const unitId = searchParams.get("unitId")

  const [unit, setUnit] = useState<StorageUnit | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form data
  const [userName, setUserName] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  useEffect(() => {
    if (unitId) {
      fetchUnit()
    }
  }, [unitId])

  const fetchUnit = async () => {
    try {
      const response = await fetch("/api/units")
      const units = await response.json()
      const selectedUnit = units.find((u: StorageUnit) => u.id === Number.parseInt(unitId!))
      setUnit(selectedUnit || null)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching unit:", error)
      setLoading(false)
    }
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const calculateTotal = () => {
    if (!unit || !startDate || !endDate) return 0
    return calculateDays() * unit.pricePerDay
  }

  const validateForm = () => {
    if (!userName.trim()) {
      setError("Please enter your name")
      return false
    }
    if (!startDate) {
      setError("Please select a start date")
      return false
    }
    if (!endDate) {
      setError("Please select an end date")
      return false
    }
    if (startDate >= endDate) {
      setError("End date must be after start date")
      return false
    }
    if (startDate < new Date()) {
      setError("Start date cannot be in the past")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setSubmitting(true)

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: userName.trim(),
          unitId: Number.parseInt(unitId!),
          startDate: startDate!.toISOString(),
          endDate: endDate!.toISOString(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/bookings?userName=${encodeURIComponent(userName.trim())}`)
        }, 2000)
      } else {
        setError(result.error || "Failed to create booking")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
        <p className="ml-4 text-gray-600 font-medium">Loading unit details...</p>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unit Not Found</h2>
          <p className="text-gray-600 mb-4">The storage unit you're looking for doesn't exist.</p>
          <a href="/" className="btn-primary">
            Browse Available Units
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-green-600 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your storage unit has been successfully booked.</p>
          <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
        </div>
      </div>
    )
  }

  const days = calculateDays()
  const total = calculateTotal()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <a href="/" className="text-red-600 hover:text-red-700 font-medium">
          ← Back to Units
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unit Details */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{unit.name}</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">{unit.size}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{unit.location}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Daily Rate:</span>
              <span className="font-bold text-red-600">${unit.pricePerDay}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Status:</span>
              <span className="badge-available">Available</span>
            </div>
          </div>

          {unit.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{unit.description}</p>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Unit</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  minDate={new Date()}
                  placeholderText="Select start date"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  minDate={startDate || new Date()}
                  placeholderText="Select end date"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span className="font-medium">${unit.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-red-600">
                    <span>Total Cost:</span>
                    <span>${total}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="loading-spinner mr-2" style={{ width: "20px", height: "20px" }}></div>
                  Creating Booking...
                </span>
              ) : (
                `Confirm Booking - $${total}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading-spinner"></div>
          <p className="ml-4 text-gray-600 font-medium">Loading...</p>
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  )
}
