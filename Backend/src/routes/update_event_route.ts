import { Router } from "express";
import handle_update_event  from "../controllers/update-event";

const router = Router();
router.post("/", handle_update_event);
export default router;
