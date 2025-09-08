const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    status: 'error',
    message: 'Internal server error'
  };

  // Validation error
  if (err.isJoi) {
    error.message = err.details[0].message;
    return res.status(400).json(error);
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry. Record already exists.';
    return res.status(409).json(error);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.message = 'Referenced record not found.';
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  // Custom application errors
  if (err.statusCode) {
    error.message = err.message;
    return res.status(err.statusCode).json(error);
  }

  // Default server error
  res.status(500).json(error);
};

module.exports = errorHandler;
