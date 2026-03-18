const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    passwordHash: { type: String, required: true },
    walletBalance: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['unverified', 'verified'], default: 'unverified' }
  },
  { timestamps: true }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = { User };


