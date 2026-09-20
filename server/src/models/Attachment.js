import { Schema, model } from 'mongoose';

const attachmentSchema = new Schema(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true, trim: true, maxlength: 250 },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

attachmentSchema.index({ issue: 1, createdAt: -1 });
attachmentSchema.index({ storedName: 1 }, { unique: true });

export default model('Attachment', attachmentSchema);