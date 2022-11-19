const { check } = require("express-validator");
exports.login_middlware = [
  check("password", "Password required").not().isEmpty(),
];
exports.forgot_password_validator = [
  check("email", "Email required").not().isEmpty(),
];
exports.reset_password_validator = [
  check("password", "Password required").not().isEmpty(),
];
