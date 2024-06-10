const jwt = require("jsonwebtoken");

const allowAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.ADMIN_JWT_SIGNATURE, async (err) => {
      if (err) {
        res.json({ message: "Unauthorized" });
      } else {
        next();
      }
    });
  } else {
    res.json({ message: "Unauthorized" })
  }
};

const allowAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.ADMIN_JWT_SIGNATURE, async (err) => {
      if (err) {
        jwt.verify(token, process.env.USER_JWT_SIGNATURE, async (err) => {
          if (err) {
            res.status(401).json({ message: "Unauthorized" });
          } else {
            next();
          }
        });
      } else {
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { allowAdmin, allowAuth };