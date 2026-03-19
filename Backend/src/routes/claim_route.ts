import { Router } from "express";
import handle_claim from "../controllers/handle_claim";

const router = Router();
router.post("/", handle_claim);
export default router;
