import { getAuthenticatedUser } from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const authenticate = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('A bearer token is required.', 401, 'AUTHENTICATION_REQUIRED');
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError('A bearer token is required.', 401, 'AUTHENTICATION_REQUIRED');
  }

  request.user = await getAuthenticatedUser(token);
  next();
});

export default authenticate;
