import { Router } from "express";
import handle_get_all_students from "../controllers/get-all-students";

const router = Router();
router.post("/", handle_get_all_students);
export default router;
