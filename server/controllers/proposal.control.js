// controllers/proposal.control.js - UPDATED
import Student from "../models/student.model.js";
import { uploadProposalToCloudinary } from "../utils/upload.utils.js";
import cloudinary from "../configs/cloudinary.config.js";

export const submitProposal = async (req, res) => {
    try {
        const { title, abstract, keywords } = req.body;
        const studentId = req.studentId; // Changed from req.user.id to req.studentId

        if (!title || !abstract || !req.file) {
            return res.status(400).json({
                success: false,
                message: "All fields required"
            });
        }

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ 
                success: false, 
                message: "Only PDF files" 
            });
        }

        if (req.file.size > 2 * 1024 * 1024) {
            return res.status(400).json({ 
                success: false, 
                message: "Max 2MB" 
            });
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        if (student.proposalStatus === 'submitted' || student.proposalStatus === 'approved') {
            return res.status(400).json({ success: false, message: "Already submitted" });
        }

        if (!student.teamId) {
            return res.status(400).json({ success: false, message: "Join team first" });
        }

        const uploadResult = await uploadProposalToCloudinary(req.file.buffer);

        const keywordArray = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [];

        const updated = await Student.findByIdAndUpdate(studentId, {
            proposalStatus: 'submitted',
            projectTitle: title,
            projectAbstract: abstract,
            keywords: keywordArray,
            proposalFile: { public_id: uploadResult.public_id, url: uploadResult.secure_url },
            proposalSubmittedAt: new Date()
        }, { new: true }).select('-password');

        res.json({
            success: true,
            message: "Proposal submitted",
            data: {
                status: updated.proposalStatus,
                title: updated.projectTitle,
                submittedAt: updated.proposalSubmittedAt
            }
        });

    } catch (error) {
        console.error("Submit error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getProposal = async (req, res) => {
    try {
        const studentId = req.studentId; // Changed from req.user.id to req.studentId
        const student = await Student.findById(studentId).select(
            'proposalStatus projectTitle projectAbstract keywords proposalFile proposalSubmittedAt proposalFeedback'
        );

        if (!student) return res.status(404).json({ success: false, message: "Not found" });

        res.json({ success: true, data: student });
    } catch (error) {
        console.error("Get error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProposal = async (req, res) => {
    try {
        const studentId = req.studentId; // Changed from req.user.id to req.studentId
        const { title, abstract, keywords } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Not found" });

        if (student.proposalStatus === 'submitted' || student.proposalStatus === 'approved') {
            return res.status(400).json({ success: false, message: "Cannot update" });
        }

        let update = { 
            projectTitle: title, 
            projectAbstract: abstract,
            proposalStatus: 'pending' 
        };

        if (keywords) update.keywords = keywords.split(',').map(k => k.trim()).filter(k => k);

        if (req.file) {
            if (student.proposalFile?.public_id) {
                await cloudinary.uploader.destroy(student.proposalFile.public_id);
            }
            const upload = await uploadProposalToCloudinary(req.file.buffer);
            update.proposalFile = { 
                public_id: upload.public_id, 
                url: upload.secure_url 
            };
        }

        const updated = await Student.findByIdAndUpdate(studentId, update, { new: true }).select('-password');
        res.json({ success: true, message: "Updated", data: updated });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllProposals = async (req, res) => {
    try {
        const proposals = await Student.find({ proposalStatus: 'submitted' })
            .select('name email rollNumber projectTitle proposalSubmittedAt')
            .populate('teamId', 'teamName')
            .sort({ proposalSubmittedAt: -1 });

        res.json({ success: true, data: proposals });
    } catch (error) {
        console.error("Get all error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const reviewProposal = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, feedback } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const updated = await Student.findByIdAndUpdate(studentId, {
            proposalStatus: status,
            proposalFeedback: feedback || ''
        }, { new: true }).select('name email proposalStatus');

        res.json({ success: true, message: `Proposal ${status}`, data: updated });
    } catch (error) {
        console.error("Review error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};