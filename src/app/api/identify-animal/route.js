import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request) {


  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const fs = require("fs")
    const path = require("path")

    const imagePath = path.join("/home/nparree/Documents/Programing/App-project/anidex/public/", image)
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString("base64")
    const dataURI = `data:image/jpeg;base64,${base64Image}`

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What animal is in this image? Please provide only the common name and scientific name in this format: Common Name (Scientific Name). For example: Red Fox (Vulpes vulpes)",
          },
          {
            type: "image_url",
            image_url: {
              url: dataURI,
            },
          },
        ],
      },
    ]  
    const openaiApiKey = process.env.OPENAI_API_KEY
    const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model : "gpt-4o-mini",
        messages,
      }),
    })

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      throw new Error(`OpenAI API error: ${errorText}`)
    }
    
    const visionResult = await visionResponse.json()  
    const animalIdentification = visionResult.choices[0]?.message?.content 
    
    if (!animalIdentification) {
      return NextResponse.json(
        { error: "No identification result from AI." },
        { status: 500 }
      )
    }

    const commonName = animalIdentification.split("(")[0].trim()  
    const scientificName = animalIdentification
      .split("(")[1]
      ?.replace(")", "")
      .trim()  // I don't know yet
    const dbAnimal = await sql`
      SELECT * FROM vernacular_names 
      WHERE vernacular_name = LOWER(${commonName})
      LIMIT 1
    `  
    if (dbAnimal.length > 0) {
      return NextResponse.json({
        found: true,
        animal: dbAnimal[0],
        identification: animalIdentification,
      })
    }

    return NextResponse.json({
      found: false,
      identification: animalIdentification,
    })  
  } catch (error) {
    console.error("Error in POST /api/identify:", error)
    return NextResponse.json(
      {
        error: "Failed to identify animal",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
