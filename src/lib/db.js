// Reads the database connection string 
// creates a client instance "sql
// Needs to be replaced by prisma

import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL)

export { sql }
