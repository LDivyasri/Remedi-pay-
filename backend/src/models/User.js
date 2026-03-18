const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    passwordHash: { type: String, required: true },
    walletBalance: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
    kyc: {
      status: { type: String, enum: ['not_started', 'pending', 'verified', 'rejected'], default: 'not_started' },
      documents: {
        aadhar: {
          number: { type: String },
          frontImage: { type: String },
          backImage: { type: String },
          verified: { type: Boolean, default: false }
        },
        pan: {
          number: { type: String },
          image: { type: String },
          verified: { type: Boolean, default: false }
        },
        address: {
          type: { type: String, enum: ['aadhar', 'utility', 'bank'], default: 'aadhar' },
          document: { type: String },
          verified: { type: Boolean, default: false }
        }
      },
      submittedAt: { type: Date },
      verifiedAt: { type: Date },
      rejectedReason: { type: String }
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String, default: 'India' }
    }
  },
  { timestamps: true }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
