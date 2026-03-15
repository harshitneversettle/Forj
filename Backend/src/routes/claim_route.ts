import { Router } from "express";
import handle_claim from "../controllers/handle_claim";

const router = Router();
router.post("/api/claim", handle_claim);
export default router;
