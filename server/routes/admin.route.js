import express from "express";
import authAdmin from "../middlewares/admin.middleware.js";
import {
  adminLogin,
  adminLogout,
  getDashboardStats,
  getAllTeachers,
  toggleTeacherStatus,
  createVisitingTeacher,
  getStudentsBySemester,
  toggleStudentStatus,
} from "../controllers/admin.control.js";

const adminRouter = express.Router();

// Auth
adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", authAdmin, adminLogout);

// Dashboard
adminRouter.get("/dashboard", authAdmin, getDashboardStats);

// Teachers
adminRouter.get("/get-teachers", authAdmin, getAllTeachers);
adminRouter.patch("/get-teachers/:id/status", authAdmin, toggleTeacherStatus);
adminRouter.post("/create-visiting-teacher", authAdmin, createVisitingTeacher);

// Students
adminRouter.get("/get-students", authAdmin, getStudentsBySemester);
adminRouter.patch("/get-students/:id/status", authAdmin, toggleStudentStatus);

export default adminRouter;
