import { sql } from "@/lib/db"   // this is your raw SQL connector
import bcrypt from "bcrypt"  
import { cookies } from "next/headers"

export async function POST(request){
    try{
        const {email, password} = await request.json()
        

        if (!email || !password) {
            console.log("Missing fields")  
            return Response.json({ error: "Missing email or password" }, { status: 400 })  
        }
        
        const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
        if(!user){
            return Response.json({error : "User doesn't exist"}, { status : 404 })
        }
        const passwordMatches = await bcrypt.compare(password, user.password_hash)
        if(!passwordMatches) {
            return Response.json({error : "invalid password"}, { status : 401 })
        }
        console.log("Sign in done")
        cookies().set("userID", user.id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // example
        })
        return Response.json({ success: true, userID : user.id })

    }

    catch (err){
        console.log("prout")
        return Response.json({error: "server error"}, { status : 500 })
    }
}