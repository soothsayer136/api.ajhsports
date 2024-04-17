const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const blogSchema = new Schema(
  {
    image: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, unique: true, index: true, slug: 'title' },
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
