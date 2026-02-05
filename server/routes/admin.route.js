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
  approveSupervisorRequest,
  declineSupervisorRequest,
  isAuth,
} from "../controllers/admin.control.js";

const adminRouter = express.Router();

// Auth
adminRouter.post("/login", adminLogin);

// Dashboard
adminRouter.get("/dashboard", authAdmin, getDashboardStats);
adminRouter.get("/is-auth", authAdmin, isAuth);

// Teachers
adminRouter.get("/get-teachers", authAdmin, getAllTeachers);
adminRouter.patch("/get-teachers/:id/status", authAdmin, toggleTeacherStatus);
adminRouter.post("/create-visiting-teacher", authAdmin, createVisitingTeacher);

// Students (authAdmin removed here)
adminRouter.get("/get-students", getStudentsBySemester);

// Admin supervisor requests
adminRouter.post("/supervisor/approve", authAdmin, approveSupervisorRequest);
adminRouter.post("/supervisor/decline", authAdmin, declineSupervisorRequest);

export default adminRouter;
