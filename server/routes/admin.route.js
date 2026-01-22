import express from "express";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
  getDashboardStats,
  getAllTeachers,
  toggleTeacherStatus,
  getStudentsBySemester,
  toggleStudentStatus,
} from "../controllers/admin.control.js";

const router = express.Router();
router.get("/dashboard", adminMiddleware, getDashboardStats);
router.get("/teachers", adminMiddleware, getAllTeachers);
router.patch("/teachers/:id/status", adminMiddleware, toggleTeacherStatus);
router.get("/students", adminMiddleware, getStudentsBySemester);
router.patch("/students/:id/status", adminMiddleware, toggleStudentStatus);

export default router;
