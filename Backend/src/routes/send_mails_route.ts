import { Router } from "express";
import handle_send_mails from "../controllers/send-mails";

const router = Router();
router.post("/", handle_send_mails);

export default router;
