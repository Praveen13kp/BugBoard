import { Schema, model } from 'mongoose';

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    key: { type: String, required: true, trim: true, uppercase: true, maxlength: 12 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

projectSchema.index({ key: 1 }, { unique: true });
projectSchema.index({ members: 1 });

export default model('Project', projectSchema);
