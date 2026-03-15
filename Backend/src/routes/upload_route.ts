import { Router } from "express";
import handle_upload from "../controllers/handle_upload";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  "/",
  upload.fields([
    { name: "csv", maxCount: 1 },
    { name: "template", maxCount: 1 },
  ]),
  handle_upload,
);

export default router;
