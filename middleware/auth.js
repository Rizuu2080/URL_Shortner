const { getUserBySessionId } = require('../services/auth');

function authenticateUser(req, res, next) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return res.status(401).redirect('/login');
  }
  const user = getUserBySessionId(sessionId);
  if (!user) {
    return res.status(401).redirect('/login');
  }
  req.user = user;
  res.locals.user = user;
  next();
}

function checkAuth(req, res, next) {
    const sessionId = req.cookies.sessionId;

    const user = getUserBySessionId(sessionId);
    
    req.user = user;
    next();
}
function restrictToRoles(roles=[]) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).redirect('/login');
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
}

module.exports = { authenticateUser, checkAuth, restrictToRoles };