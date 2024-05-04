const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const commentSchema = new Schema({
  comment: {
    type: String
  },
  forum: {
    type: Schema.Types.ObjectId, ref: 'Comment'
  },
  parentComment: {
    type: Schema.Types.ObjectId, ref: 'Comment'
  },
  replies: {
    type: [Schema.Types.ObjectId], ref: 'Comment'
  },
  postedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  is_deleted: { type: Boolean, default: false }, 
},{
  timestamps: true
})

const onlineForumSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User" },
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const OnlineForum = mongoose.model('OnlineForum', onlineForumSchema);
const CommentForum = mongoose.model('Comment', commentSchema);

module.exports = {
  OnlineForum, 
  CommentForum
}
