const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventRegistrationSchema = new Schema({
  event: {type: Schema.Types.ObjectId, ref: 'Event'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  attended: {type: Boolean, default: false },
  isActive: { type:Boolean, default: true},
  isDeleted: { type:Boolean, default: false},
});

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);
