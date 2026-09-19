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
    reporter: serializeUserRef(issue.reporter),
    assignee: serializeUserRef(issue.assignee),
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}