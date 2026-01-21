/*
import jwt from "jsonwebtoken";

const authTeacher = async (req, res, next) => {
  const { teacherToken } = req.cookies;
  if (!teacherToken) {
    return res.json({ success: false, message: "Unauthorized" });
  }
  try {
    console.log("\x1b[33m%s\x1b[0m", "Reached teacher middleware");
    const tokenDecode = jwt.verify(teacherToken, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.teacherId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "not authorized" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authTeacher;
*/
import jwt from "jsonwebtoken";
import Teacher from "../models/teacher.model.js";

const authTeacher = async (req, res, next) => {
  const { teacherToken } = req.cookies;

  if (!teacherToken) {
    return res.json({ success: false, message: "Unauthorized" });
  }

  try {
    const tokenDecode = jwt.verify(teacherToken, process.env.JWT_SECRET);

    if (!tokenDecode.id) {
      return res.json({ success: false, message: "Not authorized" });
    }

    // IMPORTANT: set both req.user and req.teacherId
    req.teacherId = tokenDecode.id;

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authTeacher;
