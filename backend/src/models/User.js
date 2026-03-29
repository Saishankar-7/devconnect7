const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['developer', 'employee'], required: true },
  company: { type: String }, // For employees
  skills: [{ type: String }], // For developers
  bio: { type: String },
  resumeUrl: { type: String },
  avatarUrl: { type: String },
  githubUrl: { type: String }, // For developers
  portfolioUrl: { type: String }, // For developers
  experience: { type: String }, // For employees
  rating: { type: Number, default: 0 },
  referralsCount: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await require('bcryptjs').genSalt(10);
  this.password = await require('bcryptjs').hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await require('bcryptjs').compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
