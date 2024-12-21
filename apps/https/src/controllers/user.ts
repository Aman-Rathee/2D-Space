import { Request, Response } from "express";
import client from '@repo/db/client';
import { updateMetadataSchema } from "../types";


export const metadata = async (req: Request, res: Response) => {
  const parsedData = updateMetadataSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }

  try {
    await client.user.update({
      where: {
        id: req.userId
      },
      data: {
        avatarId: parsedData.data.avatarId
      }
    })
    res.json({ message: "Metadata updated" });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error'
    })
  }
};

export const bulkMetadata = async (req: Request, res: Response) => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = (userIdString).slice(1, userIdString?.length - 1).split(",");

  try {
    const metadata = await client.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }, select: {
        avatar: true,
        id: true
      }
    })

    res.json({
      avatars: metadata.map(m => ({
        userId: m.id,
        avatarId: m.avatar?.imageUrl
      }))
    })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error'
    })
  }
};
