const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const Price = {
  name: { type: String },
  private: { type: Number },
  group: { type: Number },
};

const coachingLessonSchema = new Schema(
  {
    image: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, unique: true, index: true, slug: "title" },
    price: { type: [Price] },
    time: { type: String },
    interval: { type: String },
    location: { type: String },
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoachingLesson", coachingLessonSchema);
