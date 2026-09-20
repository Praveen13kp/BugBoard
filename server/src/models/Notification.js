import { Schema, model } from 'mongoose';
import { NOTIFICATION_TYPES } from '../utils/enums.js';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    issueTitle: { type: String, required: true, trim: true, maxlength: 250 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export default model('Notification', notificationSchema);