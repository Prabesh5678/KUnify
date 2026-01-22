import jwt from "jsonwebtoken";

const adminMiddleware = (req, res, next) => {
  const { adminToken } = req.cookies;

  if (!adminToken) {
    return res.json({ success: false, message: "Admin unauthorized" });
  }

  try {
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.json({ success: false, message: "Access denied" });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default adminMiddleware;
