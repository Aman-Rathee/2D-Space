import { Request, Response } from "express";
import { signinSchema, signupSchema } from "../types/index";
import client from '@repo/db/client';
import jwt from "jsonwebtoken"
import "dotenv/config"
import { compare, hash } from "../scrypt";

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

export const signup = async (req: Request, res: Response) => {
  const parsedData = signupSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }

  try {
    const hashedPassword = await hash(parsedData.data.password)
    const user = await client.user.create({
      data: {
        email: parsedData.data.email,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      }
    })
    res.status(200).json({ userId: user.id });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const parsedData = signinSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }

  try {
    const user = await client.user.findUnique({
      where: { email: parsedData.data.email }
    })

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return
    }
    const isValid = await compare(parsedData.data.password, user.password)
    if (!isValid) {
      res.status(401).json({ message: "Invalid password" })
      return
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.status(200).json({ token });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
};