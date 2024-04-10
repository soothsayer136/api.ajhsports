const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  eventName: { type: String, required: true },
  eventDescription: { type: String, required: true },
  eventSlug: { type: String},
  startDate: { type: Date},
  endDate: { type: Date},
  startTime: { type: String},
  endTime: { type: String},
  occurrence : { type: [String], enum: [
    'weekdays',
    'weekends',
    'sun',
    'mon',
    'tue',
    'wed',
    'thrus',
    'fri',
    'sat',
  ]},
  isActive: { type:Boolean, default: true},
  isDeleted: { type:Boolean, default: false}
});

module.exports = mongoose.model('Event', EventSchema);
