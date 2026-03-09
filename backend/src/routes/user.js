const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDiscoverUsers, getUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getUsers);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/discover', protect, getDiscoverUsers);
router.route('/:id').get(protect, getUserById);

module.exports = router;
