var jwt = require('jwt-simple');

module.exports = {

  errorHandler: function (error, req, res, value) {
    // send error message to client
    // message for gracefull error handling on app
    var stat = value || 500;
    res.status(stat).send(error);
  },

  decode: function (req, res, next) {
    var token = req.headers['x-access-token'];
    var user;

    if (!token) {
      return res.send(403); // send forbidden if a token is not provided
    }

    try {
      // decode token and attach user to the request
      // for use inside our controllers
      user = jwt.decode(token, 'secret');
      req.user = user;
      next();
    } catch (error) {
      return next(error);
    }

  }
};
