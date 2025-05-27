import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userName, unitId, startDate, endDate } = body

    if (!userName || !unitId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: userName.trim(),
        unitId,
        startDate,
        endDate,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data.booking || data, { status: 201 })
    } else {
      return NextResponse.json({ error: data.error || "Failed to create booking" }, { status: response.status })
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to connect to backend server" }, { status: 503 })
  }
}
