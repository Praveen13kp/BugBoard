import { authenticateUser, createAccessToken, registerUser } from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import serializeUser from '../utils/serializeUser.js';
import { validateLogin, validateRegistration } from '../validators/authValidator.js';

export const register = asyncHandler(async (request, response) => {
  const input = validateRegistration(request.body);
  const user = await registerUser(input);
  const token = createAccessToken(user);

  response.status(201).json({ success: true, data: { user: serializeUser(user), token } });
});

export const login = asyncHandler(async (request, response) => {
  const input = validateLogin(request.body);
  const user = await authenticateUser(input);
  const token = createAccessToken(user);

  response.status(200).json({ success: true, data: { user: serializeUser(user), token } });
});

export function getMe(request, response) {
  response.status(200).json({ success: true, data: { user: serializeUser(request.user) } });
}
