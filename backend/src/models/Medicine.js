const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    category: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    expiryDate: { type: Date },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    images: [{ type: String }]
  },
  { timestamps: true }
);

medicineSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);


