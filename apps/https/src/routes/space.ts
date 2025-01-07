import { Router } from "express";
import { addElementToSpace, allSpaces, createSpace, deleteElementFromSpace, deleteSpace, getSpace } from "../controllers/space";
import { userMiddleware } from "../middlewares/user";

export const spaceRouter = Router();
spaceRouter.use(userMiddleware)

spaceRouter.post('/create', createSpace)
spaceRouter.get('/all', allSpaces)
spaceRouter.get('/:spaceId', getSpace)
spaceRouter.delete('/:spaceId', deleteSpace)

spaceRouter.post('/element', addElementToSpace)
spaceRouter.delete('/element', deleteElementFromSpace)