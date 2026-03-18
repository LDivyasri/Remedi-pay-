const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['sale', 'purchase'], required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['upi', 'cod', 'card'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    upiReference: { type: String },
    otp: { type: String },
    cardNumber: { type: String },
    upiId: { type: String },
    paymentDetails: { type: String }
  },
  { timestamps: true }
);

transactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

transactionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);


