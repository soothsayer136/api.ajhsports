const { Schema, default: mongoose } = require("mongoose");

const matchSchema = new Schema(
    {
      player1: { type: Schema.Types.ObjectId, ref: 'User' },
      player2: { type: Schema.Types.ObjectId, ref: 'User' },
      dateTime: {type: Date},
      notice: { type: Schema.Types.ObjectId, ref: 'Notice' },
      is_deleted: { type: Boolean, default: false },
      is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Match', matchSchema);