import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 5000 },
  },
  { timestamps: true },
);

commentSchema.index({ issue: 1, createdAt: -1 });

export default model('Comment', commentSchema);
