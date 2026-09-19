import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/userService.js';

export const listUsers = asyncHandler(async (_request, response) => {
  const users = await userService.listUsers();
  response.json({ success: true, data: { users } });
});