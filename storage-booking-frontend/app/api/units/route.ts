import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/units`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data.units || data)
    }

    throw new Error("Backend API not available")
  } catch (error) {
    console.error("Error fetching units from backend:", error)
    return NextResponse.json(
      { error: "Failed to fetch storage units. Please ensure the backend server is running." },
      { status: 503 },
    )
  }
}
