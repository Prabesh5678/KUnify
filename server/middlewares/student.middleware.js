
import jwt from "jsonwebtoken";

const authStudent = async (req, res, next) => {
  const { studentToken } = req.cookies;
  if (!studentToken) {
    return res.json({ success: false, message: "Unauthorized" });
  }
  try {
    console.log("\x1b[32m%s\x1b[0m", "Reached student middleware");
    const tokenDecode = jwt.verify(studentToken, process.env.JWT_SECRET);
    if (tokenDecode.id) {
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