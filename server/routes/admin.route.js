import express from "express";
import authAdmin from "../middlewares/admin.middleware.js";
import {
  getDashboardStats,
  getAllTeachers,
  toggleTeacherStatus,
  getStudentsBySemester,
  toggleStudentStatus,
} from "../controllers/admin.control.js";

const adminRouter = express.Router();

// Dashboard
adminRouter.get("/dashboard", authAdmin, getDashboardStats);

// Teachers
adminRouter.get("/get-teachers", authAdmin, getAllTeachers);
adminRouter.patch("/get-teachers/:id/status", authAdmin, toggleTeacherStatus);

// Students
adminRouter.get("/get-students", authAdmin, getStudentsBySemester);
adminRouter.patch("/get-students/:id/status", authAdmin, toggleStudentStatus);

export default adminRouter;
