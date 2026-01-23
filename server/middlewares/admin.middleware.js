const authAdmin = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey) {
    return res.json({
      success: false,
      message: "Admin key missing",
    });
  }

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.json({
      success: false,
      message: "Admin unauthorized",
    });
  }

  next();
};

export default authAdmin;
