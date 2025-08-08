const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const requireAdmin = checkRole(['admin']);
const requireSupervisorOrAdmin = checkRole(['admin', 'supervisor']);
const requireAgent = checkRole(['admin', 'supervisor', 'agent']);

module.exports = {
  requireAdmin,
  requireSupervisorOrAdmin,
  requireAgent
};