import { Router } from "express";
import upload from "../middleware/upload";
import { validateDocument } from "../middleware/validation";
import { protect, authorize } from "../middleware/auth";
import {
  ajouterDocument,
  supprimerDocument,
  getDocuments,
} from "../controllers/documentController";

const router = Router();

router.use(protect);

router.get("/:personneId/documents", getDocuments);

router.post(
  "/:personneId/documents",
  authorize("admin", "membre"),
  upload.single("document"),
  validateDocument,
  ajouterDocument,
);

router.delete(
  "/:personneId/documents/:documentId",
  authorize("admin", "membre"),
  supprimerDocument,
);

export default router;
