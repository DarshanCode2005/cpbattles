import express from "express";
import {
  verifyUser,
  checkSubmission,
  getMe,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { validateHandle } from "../middleware/validation";

const router = express.Router();

router.post("/verify-user", validateHandle, verifyUser);
router.post("/check-submission", validateHandle, checkSubmission);
router.get("/me", authenticateToken, getMe);

export default router;
