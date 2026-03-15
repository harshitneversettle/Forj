import { Router } from "express";
import handle_verify from "../controllers/handle_verify";

const router = Router();
router.post("/api/verify", handle_verify);
export default router;
