import { z } from "zod";

export const signupSchema = z.object({
    username: z.string(),
    password: z.string(),
    type: z.enum(["user", "admin"]).optional(),
})

export const signinSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export const updateMetadataSchema = z.object({
    avatarId: z.string()
})

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId: z.string().optional(),
})

export const createElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean(),
})

export const updateElementSchema = z.object({
    imageUrl: z.string(),
})

// Add Element to the space
export const addElementToSpaceSchema = z.object({
    spaceId: z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
})

// Delete the Element from the space
export const deleteElementFromSpaceSchema = z.object({
    id: z.string(),
})

export const createAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string(),
})

export const createMapSchema = z.object({
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    name: z.string(),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number(),
    }))
})


declare global {
    namespace Express {
        export interface Request {
            role?: "Admin" | "User";
            userId?: string;
        }
    }
}