import { Router } from "express";
import { generate_certificate } from "../controllers/generate-certificate";

const router = Router();
router.post("/api/generate_certificate", generate_certificate);
export default router;
