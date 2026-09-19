import { Schema, model } from 'mongoose';

const activitySchema = new Schema(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true, maxlength: 100 },
    field: { type: String, trim: true, maxlength: 100, default: null },
    oldValue: { type: String, default: null },
    newValue: { type: String, default: null },
    timestamp: { type: Date, default: Date.now, required: true },
  },
  { timestamps: false },
);

activitySchema.index({ issue: 1, timestamp: -1 });

export default model('Activity', activitySchema);
