import LoginHistory from "../models/loginHistory.model.js";

export const getTeacherLoginHistory = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const history = await LoginHistory.find({ teacherId })
      .sort({ loginAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, history });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};