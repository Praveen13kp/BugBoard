import { Schema, model } from 'mongoose';
import { ISSUE_PRIORITIES, ISSUE_SEVERITIES, ISSUE_STATUSES } from '../utils/enums.js';

const issueSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 3, maxlength: 10000 },
    severity: { type: String, enum: ISSUE_SEVERITIES, required: true },
    priority: { type: String, enum: ISSUE_PRIORITIES, required: true },
    status: { type: String, enum: ISSUE_STATUSES, default: 'OPEN', required: true },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

issueSchema.index({ project: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ assignee: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ project: 1, status: 1, updatedAt: -1 });
issueSchema.index({ project: 1, assignee: 1, status: 1 });

export default model('Issue', issueSchema);
