import { NextResponse } from "next/server" 
import { prisma } from "../../../lib/prisma"  
import bcrypt from "bcrypt" 

export async function POST(req) {
  try {
    const { email, password } = await req.json() 

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 }) 
    }

    const existingUser = await prisma.user.findUnique({ where: { email } }) 

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 }) 
    }

    const hashedPassword = await bcrypt.hash(password, 10) 

    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      }
    }) 

    return NextResponse.json({ success: true }, { status: 201 }) 
  } catch (error) {
    console.error("Error in sign up:", error) 
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }) 
  }
}
