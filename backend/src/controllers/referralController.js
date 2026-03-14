const Referral = require('../models/Referral');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a referral request
// @route   POST /api/referrals
// @access  Private (Developer)
const createReferralRequest = async (req, res) => {
  const { referrerId, company, jobUrl, message } = req.body;

  try {
    const referrer = await User.findById(referrerId);
    if (!referrer || referrer.role !== 'employee') {
      return res.status(404).json({ message: 'Referrer not found or not an employee' });
    }

    // Check if a referral request already exists between this user and this employee
    const existingReferral = await Referral.findOne({
      requester: req.user._id,
      referrer: referrerId
    });

    if (existingReferral) {
      return res.status(400).json({ message: 'You have already requested a referral from this employee.' });
    }

    const newReferral = new Referral({
      requester: req.user._id,
      referrer: referrerId,
      company,
      jobUrl,
      message,
    });

    const createdReferral = await newReferral.save();

    // Create Notification
    const textDesc = `You have a new referral request from ${req.user.name} for ${company}.`;
    const notification = new Notification({
      recipient: referrerId,
      sender: req.user._id,
      type: 'referral_request',
      message: textDesc,
      linkURL: '/dashboard'
    });
    await notification.save();

    // Emit Real-time Event
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const targetSocketId = connectedUsers?.get(referrerId.toString());
    
    if (io && targetSocketId) {
      const notificationToSend = {
        ...notification.toObject(),
        sender: {
          _id: req.user._id,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl
        }
      };
      io.to(targetSocketId).emit('newNotification', notificationToSend);
    }

    res.status(201).json(createdReferral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all referral requests (for either developer or employee)
// @route   GET /api/referrals
// @access  Private
const getReferralRequests = async (req, res) => {
  try {
    let referrals;
    if (req.user.role === 'developer') {
      referrals = await Referral.find({ requester: req.user._id })
        .populate('referrer', 'name email company avatarUrl');
    } else {
      referrals = await Referral.find({ referrer: req.user._id })
        .populate('requester', 'name email skills bio resumeUrl avatarUrl');
    }
    
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update referral status
// @route   PUT /api/referrals/:id/status
// @access  Private (Employee)
const updateReferralStatus = async (req, res, status) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    // Ensure only the referrer can update the status
    if (referral.referrer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this referral' });
    }

    referral.status = status;
    const updatedReferral = await referral.save();

    // Create Notification for the developer
    const textDesc = `Your referral request for ${referral.company} has been ${status}.`;
    const notification = new Notification({
      recipient: referral.requester,
      sender: req.user._id,
      type: status === 'accepted' ? 'referral_accepted' : 'referral_rejected',
      message: textDesc,
      linkURL: '/dashboard'
    });
    await notification.save();

    // Emit Real-time Event
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const targetSocketId = connectedUsers?.get(referral.requester.toString());
    
    if (io && targetSocketId) {
      const notificationToSend = {
        ...notification.toObject(),
        sender: {
          _id: req.user._id,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl
        }
      };
      io.to(targetSocketId).emit('newNotification', notificationToSend);
    }

    res.json(updatedReferral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptReferral = (req, res) => updateReferralStatus(req, res, 'accepted');
const rejectReferral = (req, res) => updateReferralStatus(req, res, 'rejected');

module.exports = {
  createReferralRequest,
  getReferralRequests,
  acceptReferral,
  rejectReferral
};
