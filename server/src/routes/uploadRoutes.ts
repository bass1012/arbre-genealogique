import { Router } from "express";
import upload from "../middleware/upload";
import {
  uploadPhoto,
  uploadPhotoBase64,
  removePhoto,
} from "../controllers/uploadController";
import { protect, authorize } from "../middleware/auth";

const router = Router();

router.use(protect);

router.post(
  "/photo",
  authorize("admin", "membre"),
  upload.single("photo"),
  uploadPhoto,
);

router.post("/photo/base64", authorize("admin", "membre"), uploadPhotoBase64);

router.delete("/photo", authorize("admin", "membre"), removePhoto);

export default router;
