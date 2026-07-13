const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      errors: messages,
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

module.exports = errorHandler;
