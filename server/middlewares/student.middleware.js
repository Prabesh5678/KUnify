import jwt from "jsonwebtoken";

const authStudent = async (req, res, next) => {
  const { studentToken } = req.cookies;
  if (!studentToken) {
    return res.json({ success: false, message: "Unauthorized" });
  }
  try {
    const tokenDecode = jwt.verify(studentToken, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      // Set userId on req object, not req.body
      req.studentId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "not authorized" });
    }
    next();
  } catch (error) {
   return res.json({ success: false, message: error.message });
  }
};

export default authStudent;
