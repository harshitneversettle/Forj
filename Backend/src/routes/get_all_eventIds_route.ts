import { Router } from "express";
import handle_get_all_eventIds from "../controllers/get-all-eventIds";

const router = Router();
router.post("/", handle_get_all_eventIds);
export default router;
