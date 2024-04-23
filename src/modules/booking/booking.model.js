const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    lesson: {type: Schema.Types.ObjectId, ref: 'CoachingLesson'},
    is_payed: { type: Boolean, default: false},
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Booking', bookingSchema);
