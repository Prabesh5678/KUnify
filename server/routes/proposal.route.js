
import express from 'express';
import {
    submitProposal,
    getProposal,
    updateProposal,
    getAllProposals,
    reviewProposal
} from '../controllers/proposal.control.js';
import authStudent from '../middlewares/student.middleware.js'; // Default import
import { uploadProposalSingle } from '../utils/upload.utils.js';

const router = express.Router();

// Student routes
router.post('/submit', authStudent, uploadProposalSingle, submitProposal);
router.get('/my', authStudent, getProposal);
router.put('/update', authStudent, uploadProposalSingle, updateProposal);

// Admin routes
router.get('/all', getAllProposals); // Add admin middleware later
router.put('/review/:studentId', reviewProposal); // Add admin middleware later

export default router;