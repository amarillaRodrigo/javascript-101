const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errors = error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    res.status(400).json({ success: false, errors });
  }
};

module.exports = validate;
