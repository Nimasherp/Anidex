import { sql } from "@/lib/db"   // this is your raw SQL connector
import bcrypt from "bcrypt"  
import { cookies } from "next/headers"

export async function POST(request) {
  
  try {
    const { email, password } = await request.json()  

    if (!email || !password) {
      console.log("Missing fields")  
      return Response.json({ error: "Missing email or password" }, { status: 400 })  
    }

    const [existingUser] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `  

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 409 })  
    }

    const hashedPassword = await bcrypt.hash(password, 10)  

    const [user] = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email
    `
    cookies().set("userID", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // example
    })
    return Response.json({ success: true, user })  
  } catch (err) {
    console.error("Signup failed", err)  
    return Response.json({ error: "Server error" }, { status: 500 })  
  }
}

