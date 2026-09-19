const DEFAULT_ERRORS = {
  CastError: { statusCode: 422, code: 'VALIDATION_ERROR', message: 'A provided identifier is not valid.' },
  ValidationError: { statusCode: 422, code: 'VALIDATION_ERROR', message: 'The provided data is not valid.' },
  DuplicateKey: { statusCode: 409, code: 'DUPLICATE', message: 'A record with the same value already exists.' },
};

export function errorHandler(error, _request, response, _next) {
  if (error.statusCode) {
    response.status(error.statusCode).json({
      success: false,
      error: { code: error.code || 'REQUEST_ERROR', message: error.message },
    });
    return;
  }

  if (error.name === 'CastError') {
    const map = DEFAULT_ERRORS.CastError;
    response.status(map.statusCode).json({ success: false, error: { code: map.code, message: map.message } });
    return;
  }

  if (error.name === 'ValidationError') {
    const map = DEFAULT_ERRORS.ValidationError;
    response.status(map.statusCode).json({ success: false, error: { code: map.code, message: map.message } });
    return;
  }

  if (error.code === 11000) {
    const map = DEFAULT_ERRORS.DuplicateKey;
    response.status(map.statusCode).json({ success: false, error: { code: map.code, message: map.message } });
    return;
  }

  console.error(error);
  response.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred.' },
  });
}