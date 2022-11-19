const master_publisher_routers = require("express").Router();
const rateLimit = require("express-rate-limit");
const auth_middleware = require("../../middlewares/masterPublisherAuth");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests per windowMs
});

const {
  user_registartion,
  user_login,
  user_google_login,
  user_facebook_login,
  user_forgot_password,
  user_reset_password,
  user_update,
  user_info_auth,
  user_logout,
  user_logout_all,
  user_username_exist_check,
  user_change_email,
  user_change_password,
  user_add_avatar,
  user_email_verification_request,
  user_email_verify,
  user_registration_publisher,
} = require("./controller");
const { run_validation } = require("../../middlewares/express-validator");
const {
  register_middleware,
  login_middlware,
  forgot_password_validator,
  reset_password_validator,
} = require("./validator");
//multer
const multer = require("multer");
var multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const uuid = require("uuid").v4;
aws.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SCECRET_KEY,
  region: process.env.AWS_REGION,
});
const S3 = new aws.S3();
//upload image
var upload = multer({
  storage: multerS3({
    size: 3000,
    s3: S3,
    bucket: "fivestarweek/profile",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const extendname = file.originalname.split(".");
      const fileName = extendname[extendname.length - 1];
      if (fileName === "jpeg" || fileName === "jpg" || fileName === "png") {
        cb(null, uuid() + "." + fileName);
      }
    },
  }),
});
console.log(upload);
/********* users *******/

master_publisher_routers.post(
  "/login",
  limiter,
  login_middlware,
  run_validation,
  user_login
);
master_publisher_routers.post(
  "/register",
  register_middleware,
  user_registartion
);
master_publisher_routers.post(
  "/publisher/register",
  auth_middleware,
  register_middleware,
  user_registration_publisher
);
master_publisher_routers.post("/google_login", user_google_login);
master_publisher_routers.post("/facebook_login", user_facebook_login);
master_publisher_routers.put(
  "/forgot_password",
  forgot_password_validator,
  run_validation,
  user_forgot_password
);
master_publisher_routers.put(
  "/reset_password",
  reset_password_validator,
  run_validation,
  user_reset_password
);
master_publisher_routers.get("/user", auth_middleware, user_info_auth);
master_publisher_routers.put(
  "/user",
  auth_middleware,
  run_validation,
  user_update
);
master_publisher_routers.patch(
  "/username",
  auth_middleware,
  user_username_exist_check
);
master_publisher_routers.post(
  "/changeemail",
  auth_middleware,
  user_change_email
);
master_publisher_routers.post(
  "/changepassword",
  auth_middleware,
  user_change_password
);

master_publisher_routers.post(
  "/emailverification",
  auth_middleware,
  user_email_verification_request
);
master_publisher_routers.post(
  "/emailverifyonline",
  auth_middleware,
  user_email_verify
);

master_publisher_routers.post(
  "/profile/uploadone",
  auth_middleware,
  upload.single("avatar"),
  user_add_avatar
);
master_publisher_routers.post("/logout", auth_middleware, user_logout);
master_publisher_routers.post("/logoutall", auth_middleware, user_logout_all);
// /********* admin *******/

module.exports = master_publisher_routers;
