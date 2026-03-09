const express = require('express');
const router = express.Router();
const { createReferralRequest, getReferralRequests, acceptReferral, rejectReferral } = require('../controllers/referralController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/request', protect, createReferralRequest);
router.get('/history', protect, getReferralRequests);
router.put('/:id/accept', protect, acceptReferral);
router.put('/:id/reject', protect, rejectReferral);

module.exports = router;
