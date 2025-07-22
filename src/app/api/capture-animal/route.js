
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"


export async function POST(request) {
  
  try {
    const { animalId, photoUrl, captureLocation, userId } = await request.json()
    if(!userId){
      return NextResponse.json({ error: "Authentication required"}, { status: 401 })
    }
    if (!animalId || !photoUrl || !captureLocation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    // Check if animal exists
    const [animal] = await sql`
      SELECT * FROM vernacular_name WHERE taxonid = ${animalId}
    `  
    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 })
    }

    // Check if already in collection
    const [existingEntry] = await sql`
      SELECT * FROM animals_collections 
      WHERE user_id = ${session.user.id} 
      AND taxonid = ${animalId}
    `  

    if (existingEntry) {
      return NextResponse.json({ error: "Animal already in collection" }, { status: 409 })
    }

    // Add to collection
    const [newEntry] = await sql`
      INSERT INTO user_collections 
        (user_id, taxonid, photo_url, capturelocation)
      VALUES 
        (${session.user.id}, ${animalId}, ${photoUrl}, point(${captureLocation.x}, ${captureLocation.y}))
      RETURNING *
    `  
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