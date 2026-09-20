import { allowedNextStatuses } from './workflow.js';

function serializeUserRef(reference) {
  if (!reference) return null;
  if (typeof reference === 'object' && reference._id) {
    return {
      id: reference._id.toString(),
      name: reference.name,
      email: reference.email,
      role: reference.role,
    };
  }

  return { id: String(reference) };
}

function serializeProjectRef(reference) {
  if (!reference) return null;
  if (typeof reference === 'object' && reference._id) {
    return { id: reference._id.toString(), name: reference.name, key: reference.key };
  }

  return { id: String(reference) };
}

export function serializeProject(project) {
  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description,
    members: (project.members || []).map((member) => serializeUserRef(member)),
    memberCount: (project.members || []).length,
    createdBy: serializeUserRef(project.createdBy),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function serializeIssue(issue) {
  return {
    id: issue.id,
    project: serializeProjectRef(issue.project),
    title: issue.title,
    description: issue.description,
    severity: issue.severity,
    priority: issue.priority,
    status: issue.status,
    allowedStatusTransitions: allowedNextStatuses(issue.status),
    reporter: serializeUserRef(issue.reporter),
    assignee: serializeUserRef(issue.assignee),
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

export function serializeComment(comment) {
  return {
    id: comment.id,
    issue: serializeProjectRef(comment.issue),
    author: serializeUserRef(comment.author),
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

export function serializeActivity(activity) {
  return {
    id: activity.id,
    issue: String(activity.issue?._id ?? activity.issue),
    actor: serializeUserRef(activity.actor),
    action: activity.action,
    field: activity.field,
    oldValue: activity.oldValue,
    newValue: activity.newValue,
    timestamp: activity.timestamp,
  };
}

export function serializeAttachment(attachment) {
  return {
    id: attachment.id,
    issue: String(attachment.issue?._id ?? attachment.issue),
    uploader: serializeUserRef(attachment.uploader),
    originalName: attachment.originalName,
    storedName: null,
    mimeType: attachment.mimeType,
    size: attachment.size,
    image: String(attachment.mimeType || '').startsWith('image/'),
    createdAt: attachment.createdAt,
  };
}

export function serializeNotification(notification) {
  return {
    id: notification.id,
    user: String(notification.user?._id ?? notification.user),
    actor: serializeUserRef(notification.actor),
    type: notification.type,
    issue: String(notification.issue?._id ?? notification.issue),
    issueTitle: notification.issueTitle,
    message: notification.message,
    read: Boolean(notification.read),
    createdAt: notification.createdAt,
  };
}