const jwt = require("jsonwebtoken");

const allowAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.ADMIN_JWT_SIGNATURE, async (err, decodedToken) => {
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

module.exports = { allowAdmin };
