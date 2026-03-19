import { Router } from "express";
import handle_update_students from "../controllers/update-student";

const router = Router();
router.post("/", handle_update_students);
export default router;
