import {Router} from "express";
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from "../controllers/taskController.js";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;