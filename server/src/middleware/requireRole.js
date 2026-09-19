import AppError from '../utils/AppError.js';

export default function requireRole(...allowedRoles) {
  return (request, _response, next) => {
    if (!request.user) {
      throw new AppError('Authentication is required.', 401, 'AUTHENTICATION_REQUIRED');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN');
    }

    next();
  };
}