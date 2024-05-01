const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventRegistrationSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  approved: { type: Boolean, default: false },
  attended: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);
