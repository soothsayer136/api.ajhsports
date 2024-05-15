const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoticeSchema = new Schema({
    message: { type: String },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    lesson: {type: Schema.Types.ObjectId, ref: 'CoachingLesson'},
    match: {type: Schema.Types.ObjectId, ref: 'Match'},
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: [Schema.Types.ObjectId], ref: 'User' },
    read_by: [{
        readerId: { type: Schema.Types.ObjectId, ref: 'User' },
        read_at: { type: Date}
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Notice', NoticeSchema);
