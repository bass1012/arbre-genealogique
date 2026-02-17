"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("../middleware/upload"));
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.post("/photo", (0, auth_1.authorize)("admin", "membre"), upload_1.default.single("photo"), uploadController_1.uploadPhoto);
router.post("/photo/base64", (0, auth_1.authorize)("admin", "membre"), uploadController_1.uploadPhotoBase64);
router.delete("/photo", (0, auth_1.authorize)("admin", "membre"), uploadController_1.removePhoto);
exports.default = router;
