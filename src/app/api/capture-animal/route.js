
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "../../../lib/prisma"


export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const userId = session.user.id
  try {
    const { animalId, photoUrl, captureLocation } = await request.json()
    if (!animalId || !photoUrl || !captureLocation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    

    // Check if already in collection
    const existingEntry = await prisma.userCollection.findFirst({
      where : {
        taxonId : animalId,
        userId: userId,
      }
    }) 

    if (existingEntry) {
      return NextResponse.json({ error: "Animal already in collection" }, { status: 409 })
    }

    // Add to collection
    const newEntry = await prisma.userCollection.create({
      data: {
        userId: userId,
        taxonId: animalId,
        photoUrl: photoUrl,
        latitude: captureLocation.x,
        longitude: captureLocation.y,
      }
    })

    return NextResponse.json({
      success: true,
      collection: newEntry,
    })

  } catch (error) {
    console.error("Capture error:", error)
    return NextResponse.json({
      error: "Failed to capture animal",
      details: error.message,
    }, { status: 500 })
  }
}