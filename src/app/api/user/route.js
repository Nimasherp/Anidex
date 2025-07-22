import { headers } from "next/headers";
import { cookies } from "next/headers"
import { sql } from "@/lib/db"


export async function GET() {
    const userID = cookies().get("userID")?.value
    if(!userID){
        return Response.json({ user: null })
    }

    const [user] = await sql `SELECT * FROM users WHERE id = ${userID}`
    return Response.json({ user })
}