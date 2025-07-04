import express from "express";
import messageController from "./message.controller";
import auth from "../../middleware/auth";
import { userRole } from "../../constants";
const messageRoutes = express.Router();

messageRoutes.get("/getPreviousMessages",auth([userRole.admin, userRole.user]),messageController.getPreviousMessages )

export default messageRoutes