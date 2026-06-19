import LoginHistory from "../models/loginHistory.model.js";

// Paginated fetch that means admin will see 50 login history at a time
export const getTeacherLoginHistory = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      LoginHistory.find({ teacherId })
        .sort({ loginAt: -1 })
        .skip(skip)
        .limit(limit),
      LoginHistory.countDocuments({ teacherId })
    ]);

    res.status(200).json({ success: true, history, total, page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export all here is no limit
export const exportTeacherLoginHistory = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const history = await LoginHistory.find({ teacherId })
      .sort({ loginAt: -1 });

    res.status(200).json({ success: true, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};