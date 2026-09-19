import asyncHandler from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboardService.js';

export const getStats = asyncHandler(async (request, response) => {
  const stats = await dashboardService.getDashboardStats(request.user);
  response.json({ success: true, data: { stats } });
});