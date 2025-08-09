import {prisma} from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const collections = await prisma.userCollection.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        captureAt: "desc",
      },
    })
        
    return NextResponse.json({
      success: true,
      collections: collections,
    })
  } catch (error) {
    console.error("Error in POST /api/get-collection:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch collection data",
          details: error.message,
        },
        { status: 500 }
      )
  }
}
        