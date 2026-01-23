import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.json({
      success: false,
      message: "Admin not logged in",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid admin token",
    });
  }
};

export default authAdmin;
