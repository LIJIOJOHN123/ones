const jwt = require("jsonwebtoken");
const User = require("../components/publisher/schema");

const user_auth_middleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_VARIABLE);
    const user = await User.findOne({
      _id: decoded._id,
    });
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please autheticate" });
  }
};
module.exports = user_auth_middleware;
