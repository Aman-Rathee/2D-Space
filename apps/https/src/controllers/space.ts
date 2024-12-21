import { Request, Response } from "express";
import { addElementToSpaceSchema, createSpaceSchema, deleteElementFromSpaceSchema } from "../types";
import client from '@repo/db/client';

export const createSpace = async (req: Request, res: Response) => {
  const parsedData = createSpaceSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }
  try {
    if (!parsedData.data.mapId) {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: parseInt(parsedData.data.dimensions.split("x")[0]),
          height: parseInt(parsedData.data.dimensions.split("x")[1]),
          creatorId: req.userId!
        }
      });
      res.json({ spaceId: space.id })
      return;
    }
    const map = await client.map.findFirst({
      where: {
        id: parsedData.data.mapId
      }, select: {
        mapElements: true,
        width: true,
        height: true
      }
    })
    if (!map) {
      res.status(400).json({ message: "Map not found" })
      return
    }
    let space = await client.$transaction(async () => {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: map.width,
          height: map.height,
          creatorId: req.userId!,
        }
      });

      await client.spaceElements.createMany({
        data: map.mapElements.map(e => ({
          spaceId: space.id,
          elementId: e.elementId,
          x: e.x!,
          y: e.y!
        }))
      })

      return space;

    })
    res.json({ spaceId: space.id })

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const getSpace = async (req: Request, res: Response) => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId
      },
      include: {
        elements: {
          include: {
            element: true
          }
        },
      }
    })
    if (!space) {
      res.status(400).json({ message: "Space not found" })
      return
    }
    res.json({
      "dimensions": `${space.width}x${space.height}`,
      elements: space.elements.map(e => ({
        id: e.id,
        element: {
          id: e.element.id,
          imageUrl: e.element.imageUrl,
          width: e.element.width,
          height: e.element.height,
          static: e.element.static
        },
        x: e.x,
        y: e.y
      })),
    })

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const allSpaces = async (req: Request, res: Response) => {
  try {
    const spaces = await client.space.findMany({
      where: {
        creatorId: req.userId!
      }
    });
    res.json({
      spaces: spaces.map(s => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail,
        dimensions: `${s.width}x${s.height}`,
      }))
    })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const deleteSpace = async (req: Request, res: Response) => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId
      }, select: {
        creatorId: true
      }
    })
    if (!space) {
      res.status(400).json({ message: "Space not found" })
      return
    }

    if (space.creatorId !== req.userId) {
      res.status(403).json({ message: "Unauthorized" })
      return
    }

    await client.space.delete({
      where: {
        id: req.params.spaceId
      }
    })
    res.json({ message: "Space deleted" });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const addElementToSpace = async (req: Request, res: Response) => {
  const parsedData = addElementToSpaceSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }

  try {
    const space = await client.space.findUnique({
      where: {
        id: req.body.spaceId,
        creatorId: req.userId!
      }, select: {
        width: true,
        height: true
      }
    })
    if (req.body.x < 0 || req.body.y < 0 || req.body.x > space?.width! || req.body.y > space?.height!) {
      res.status(400).json({ message: "Point is outside of the boundary" })
      return
    }

    if (!space) {
      res.status(400).json({ message: "Space not found" })
      return
    }
    await client.spaceElements.create({
      data: {
        spaceId: req.body.spaceId,
        elementId: req.body.elementId,
        x: req.body.x,
        y: req.body.y
      }
    })
    res.json({ message: "Element added" });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const deleteElementFromSpace = async (req: Request, res: Response) => {
  const parsedData = deleteElementFromSpaceSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" })
    return
  }
  try {
    const spaceElement = await client.spaceElements.findFirst({
      where: {
        id: parsedData.data.id
      },
      include: {
        space: true
      }
    })
    if (!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.userId) {
      res.status(403).json({ message: "Unauthorized" })
      return
    }
    await client.spaceElements.delete({
      where: {
        id: parsedData.data.id
      }
    })
    res.json({ message: "Element deleted" });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};