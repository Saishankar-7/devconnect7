const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Developer
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Employee
  company: { type: String, required: true },
  jobUrl: { type: String },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
