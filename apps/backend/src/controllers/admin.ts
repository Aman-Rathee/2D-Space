import { Request, Response } from "express";
import { prisma } from '@repo/db';
import { createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "../types";

export const createElement = async (req: Request, res: Response) => {
  const parsedData = createElementSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }

  try {
    const element = await prisma.element.create({
      data: {
        width: parsedData.data.width,
        height: parsedData.data.height,
        static: parsedData.data.static,
        imageUrl: parsedData.data.imageUrl,
      }
    })
    res.status(201).json({ message: 'Element created', id: element.id });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateElement = async (req: Request, res: Response) => {
  const parsedData = updateElementSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }

  try {
    await prisma.element.update({
      where: {
        id: req.params.elementId
      },
      data: {
        imageUrl: parsedData.data.imageUrl
      }
    })
    res.status(200).json({ message: "Element updated" });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const createAvatar = async (req: Request, res: Response) => {
  const parsedData = createAvatarSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" })
    return
  }

  try {
    const avatar = await prisma.avatar.create({
      data: {
        name: parsedData.data.name,
        imageUrl: parsedData.data.imageUrl
      }
    })
    res.status(201).json({ message: 'Avatar created', avatarId: avatar.id })

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const createMap = async (req: Request, res: Response) => {
  const parsedData = createMapSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" })
    return
  }

  try {
    const map = await prisma.map.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        thumbnail: parsedData.data.thumbnail,
        mapElements: {
          create: parsedData.data.defaultElements.map(e => ({
            elementId: e.elementId,
            x: e.x,
            y: e.y
          }))
        }
      }
    })

    res.status(200).json({ message: 'Map created', id: map.id })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};