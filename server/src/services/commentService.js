import Comment from '../models/Comment.js';
import { getIssueForUser } from './issueService.js';

function loadIssueForUser(user, issueId) {
  return getIssueForUser(user, issueId);
}

export async function listComments(user, issueId) {
  const issue = await loadIssueForUser(user, issueId);
  return Comment.find({ issue: issue.id }).sort({ createdAt: -1 }).populate('author', 'name email role');
}

export async function createComment(user, issueId, content) {
  const issue = await loadIssueForUser(user, issueId);

  const comment = await Comment.create({ issue: issue.id, author: user.id, content });
  await comment.populate('author', 'name email role');
  return comment;
}