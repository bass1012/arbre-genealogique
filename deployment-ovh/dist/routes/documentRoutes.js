"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("../middleware/upload"));
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const documentController_1 = require("../controllers/documentController");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get("/:personneId/documents", documentController_1.getDocuments);
router.post("/:personneId/documents", (0, auth_1.authorize)("admin", "membre"), upload_1.default.single("document"), validation_1.validateDocument, documentController_1.ajouterDocument);
router.delete("/:personneId/documents/:documentId", (0, auth_1.authorize)("admin", "membre"), documentController_1.supprimerDocument);
exports.default = router;
