import { Router } from "express";
import { createAvatar, createElement, createMap, updateElement } from "../controllers/admin";
import { adminMiddleware } from "../middlewares/admin";

export const adminRouter: Router = Router();
adminRouter.use(adminMiddleware)

adminRouter.post('/element', createElement)
adminRouter.put('/element/:elementId', updateElement)
adminRouter.post('/avatar', createAvatar)
adminRouter.post('/map', createMap)