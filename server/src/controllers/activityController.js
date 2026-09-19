import asyncHandler from '../utils/asyncHandler.js';
import { serializeActivity } from '../utils/serializers.js';
import * as activityService from '../services/activityService.js';

export const getActivity = asyncHandler(async (request, response) => {
  const activity = await activityService.listActivityForIssue(request.user, request.params.issueId);
  response.json({ success: true, data: { activity: activity.map(serializeActivity) } });
});