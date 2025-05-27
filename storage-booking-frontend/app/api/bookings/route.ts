import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get("userName")

    if (!userName) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/bookings?userName=${encodeURIComponent(userName.trim())}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data.bookings || data)
    } else {
      return NextResponse.json({ error: data.error || "Failed to fetch bookings" }, { status: response.status })
    }
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to connect to backend server" }, { status: 503 })
  }
}
