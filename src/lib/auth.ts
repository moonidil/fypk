import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

//sets up authentication using email and password credentials.
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      //checks the user's login details against the database.
      async authorize(credentials) {
        //returns nothing if the email or password was not provided.
        if (!credentials?.email || !credentials?.password) return null

        //looks for a user with the matching normalised email address.
        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).trim().toLowerCase() },
        })

        //returns nothing if the user does not exist or has no stored password.
        if (!user || !user.passwordHash) return null

        //compares the entered password with the stored hashed password.
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        //returns nothing if the password does not match.
        if (!valid) return null

        //returns the basic user data needed for the session.
        return { id: user.id, email: user.email }
      },
    }),
  ],

  //uses jwt-based sessions instead of storing sessions in the database.
  session: { strategy: "jwt" },

  //sends users to the custom login page when sign-in is needed.
  pages: {
    signIn: "/login",
  },
})