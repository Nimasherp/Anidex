import NextAuth from "next-auth" 
import CredentialsProvider from "next-auth/providers/credentials" 
import { PrismaAdapter } from "@next-auth/prisma-adapter" 
import { prisma } from "../../../../lib/prisma" 
import bcrypt from "bcrypt"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
      
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          }) 
      
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          ) 
      
          if (!isPasswordCorrect || !user) {
            return null 
          }
      
          return user 
        } catch (error) {
          console.error("Authorize error:", error) 
          return null 
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours logged in
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id 
      return token 
    },
    async session({ session, token }) {
      session.user.id = token.id 
      return session 
    },
  },
}) 

export { handler as GET, handler as POST } 
