const supabase = require('../supabaseClient');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.trim() === '') {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data || !data.user) {
      return res.status(401).json({
        error: 'Invalid or expired token',
      });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('Error in auth middleware:', err);
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
};

module.exports = requireAuth;
