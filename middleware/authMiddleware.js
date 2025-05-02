const authenticateRequest = (req, res, next) => {
    // Logic for authenticating API requests
    next();
  };
  
  module.exports = { authenticateRequest };
  