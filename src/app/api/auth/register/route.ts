import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

//handles user sign-up by validating input, checking for existing users, and saving a hashed password.
export async function POST(req: Request) {
  try {
    //gets the email and password sent in the request body.
    const { email, password } = await req.json()

    //returns an error if either field is missing.
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    //checks that the email is in a basic valid format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    //checks that the password is at least 8 characters long.
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    //checks whether a user with the same email already exists.
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      //returns an error if the email is already being used.
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      )
    }

    //hashes the password before storing it in the database.
    const passwordHash = await bcrypt.hash(password, 12)

    //creates the new user record with the email and hashed password.
    const user = await prisma.user.create({
      data: { email, passwordHash },
    })

    //returns the new user's basic details after successful registration.
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch {
    //returns a general error if something unexpected fails.
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}