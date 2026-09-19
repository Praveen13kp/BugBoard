const DEFAULT_ERRORS = {
  CastError: { statusCode: 422, code: 'VALIDATION_ERROR', message: 'A provided identifier is not valid.' },
  ValidationError: { statusCode: 422, code: 'VALIDATION_ERROR', message: 'The provided data is not valid.' },
  DuplicateKey: { statusCode: 409, code: 'DUPLICATE', message: 'A record with the same value already exists.' },
  InvalidJson: { statusCode: 400, code: 'INVALID_JSON', message: 'The request body is not valid JSON.' },
};

function sendError(response, statusCode, code, message) {
  response.status(statusCode).json({ success: false, error: { code, message } });
}

export function errorHandler(error, _request, response, _next) {
  if (error.type === 'entity.parse.failed' || (error instanceof SyntaxError && 'body' in error)) {
    const map = DEFAULT_ERRORS.InvalidJson;
    sendError(response, map.statusCode, map.code, map.message);
    return;
  }

  if (error.statusCode) {
    sendError(response, error.statusCode, error.code || 'REQUEST_ERROR', error.message);
    return;
  }

  if (error.name === 'CastError') {
    const map = DEFAULT_ERRORS.CastError;
    sendError(response, map.statusCode, map.code, map.message);
    return;
  }

  if (error.name === 'ValidationError') {
    const map = DEFAULT_ERRORS.ValidationError;
    sendError(response, map.statusCode, map.code, map.message);
    return;
  }

  if (error.code === 11000) {
    const map = DEFAULT_ERRORS.DuplicateKey;
    sendError(response, map.statusCode, map.code, map.message);
    return;
  }

  console.error(error);
  sendError(response, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.');
}