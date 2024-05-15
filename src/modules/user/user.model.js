const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    hash: { type: String, required: true },
    contact: { type: Number },
    address: { type: String },
    image: { type: String },
    expertiseLevel: {
      type: String,
      enum: ["new",
        "beginner",
        "intermediate",
        "advanced"],
      default: 'new'
    },
    role: {
      type: String, enum: ['user', 'admin', 'superadmin'], default: 'user'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
