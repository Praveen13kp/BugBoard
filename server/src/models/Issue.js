import { Schema, model } from 'mongoose';
import { ISSUE_PRIORITIES, ISSUE_SEVERITIES, ISSUE_STATUSES } from '../utils/enums.js';

const PRIORITY_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
const SEVERITY_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

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
    priorityRank: { type: Number, default: 1, min: 1, max: 4 },
    severityRank: { type: Number, default: 1, min: 1, max: 4 },
  },
  { timestamps: true },
);

issueSchema.pre('save', function () {
  this.priorityRank = PRIORITY_RANK[this.priority] ?? this.priorityRank ?? 1;
  this.severityRank = SEVERITY_RANK[this.severity] ?? this.severityRank ?? 1;
});

issueSchema.index({ project: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ assignee: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ updatedAt: -1 });
issueSchema.index({ priorityRank: -1, updatedAt: -1 });
issueSchema.index({ severityRank: -1, updatedAt: -1 });
issueSchema.index({ project: 1, status: 1, updatedAt: -1 });
issueSchema.index({ project: 1, assignee: 1, status: 1 });

export default model('Issue', issueSchema);