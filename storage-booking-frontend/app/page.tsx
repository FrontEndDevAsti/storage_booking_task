"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface StorageUnit {
  id: number
  name: string
  size: string
  location: string
  pricePerDay: number
  isAvailable: boolean
  description?: string
}

export default function HomePage() {
  const [units, setUnits] = useState<StorageUnit[]>([])
  const [filteredUnits, setFilteredUnits] = useState<StorageUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [sizeFilter, setSizeFilter] = useState("")

  useEffect(() => {
    fetchUnits()
  }, [])

  useEffect(() => {
    filterUnits()
  }, [units, searchTerm, locationFilter, sizeFilter])

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/units")
      const data = await response.json()
      setUnits(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching units:", error)
      setLoading(false)
    }
  }

  const filterUnits = () => {
    let filtered = units.filter((unit) => unit.isAvailable)

    if (searchTerm) {
      filtered = filtered.filter(
        (unit) =>
          unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (locationFilter) {
      filtered = filtered.filter((unit) => unit.location === locationFilter)
    }

    if (sizeFilter) {
      filtered = filtered.filter((unit) => unit.size === sizeFilter)
    }

    setFilteredUnits(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setLocationFilter("")
    setSizeFilter("")
  }

  const uniqueLocations = [...new Set(units.map((unit) => unit.location))]
  const uniqueSizes = [...new Set(units.map((unit) => unit.size))]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
        <p className="ml-4 text-gray-600 font-medium">Loading storage units...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Storage Unit</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Secure, convenient, and affordable storage solutions for all your needs
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Units</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="form-select">
              <option value="">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="form-select">
              <option value="">All Sizes</option>
              {uniqueSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={clearFilters} className="btn-secondary w-full">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredUnits.length} of {units.filter((u) => u.isAvailable).length} available units
        </div>
      </div>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No units found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
          <button onClick={clearFilters} className="btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <div key={unit.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{unit.name}</h3>
                <span className="badge-available">Available</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{unit.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{unit.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span className="font-bold text-red-600">${unit.pricePerDay}</span>
                </div>
              </div>

              {unit.description && <p className="text-gray-600 text-sm mb-4">{unit.description}</p>}

              <Link href={`/book?unitId=${unit.id}`}>
                <button className="btn-primary w-full">Book This Unit</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
