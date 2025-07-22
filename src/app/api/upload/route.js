import { NextResponse } from 'next/server'  
import { writeFile, mkdir } from 'fs/promises'  
import path from 'path'  

export async function POST(request) {
  console.log("Posted")
  try {
    const formData = await request.formData()  
    const file = formData.get('file') 

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })  
    }

    const buffer = Buffer.from(await file.arrayBuffer())  
    const filename = file.name 

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')  
    await mkdir(uploadsDir, {recursive : true})   // creates folder if missing

    const filePath = path.join(uploadsDir, filename)  

    await writeFile(filePath, buffer)  

    return NextResponse.json({url: `/uploads/${filename}`,})  
  } catch (error) {
    console.error('Upload error:', error)  
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })  
  }
}
