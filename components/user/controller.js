const idGenerator = require("../../utils/id-generator");
const User = require("./schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//user - registration
exports.user_registartion = async (req, res) => {
  try {
    const user = new User(req.body);
    const email = await User.findOne({ email: req.body.email });
    if (email) {
      return res.status(400).send({
        type: "error",
        message:
          "Your request register declined due to unspecified reason. Please try again",
      });
    }
    user.name = "";
    if (req.body.name) {
      user.name =
        req.body.name.toLowerCase().charAt(0).toUpperCase() +
        req.body.name.slice(1);
    }

    user.userId = idGenerator(20);
    randomNumber = Math.floor(Math.random() * (20000 * 30000));
    user.userName =
      req.body.name.toLowerCase().trim().replace(/\s/g, "") + randomNumber;
    user.mobile = req.body.mobile;
    user.avatars.unshift({
      image: process.env.PROFIE_AVATAR,
      zoom: "100%",
    });
    user.status = "ACTIVE";
    const token = await user.generateToken();

    await user.save();

    res.status(201).send({
      type: "success",
      user,
      token,
      message: "You have successfully logged in!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      type: "error",
      message: "Your request has been declined. Please try again",
      error: error,
    });
  }
};

//user - login
exports.user_login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send({
        type: "error",
        message: "Please verify your email and password",
      });
    if (user.status === "BLOCKED") {
      return res.status(400).send({
        type: "error",
        message:
          "You account has been blocked due to suspecious activity. Please contact our team for further infomation.",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res.status(400).send({
        type: "error",
        message: "Please verify your email and password",
      });
    const token = await user.generateToken();

    res.status(200).send({
      type: "success",
      user,
      token,
      message: "You have successfully logged in!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      type: "error",
      message: "Your request has been declined. Please try again",
    });
  }
};

//user - forgot password
exports.user_forgot_password = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(201).send({
        message: "reset email has been sent successfully",
        type: "success",
      });
    }
    const token = await jwt.sign(
      { _id: user._id },
      process.env.JWT_RESET_PASSWORD,
      { expiresIn: "1h" }
    );

    user.resetPassword = token;
    await user.save();
    //     var ses = require("node-ses"),
    //       client = ses.createClient({
    //         key: process.env.AWS_KEY,
    //         secret: process.env.AWS_SCECRET_KEY,
    //       });

    //     client.sendEmail(
    //       {
    //         cc: [`${email}`],
    //         from: process.env.SESFROMMAIL,
    //         subject: "FiveStarWeek password assistance",
    //         message: `   <p>Hi ${user.name},</p> <br/>
    //           <h4>Please click <button> <a href=${link}>Click here<a/></button> to reset your password</h4>
    //           <br/>
    //           <p>NB: This link expire after 10 minute.</p>
    //            <br/>
    //           <p>NB:Don't share  above link with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info.</p>
    //           `,
    //         altText: "plain text",
    //       },
    //       function (err, data, res) {
    //         // ...
    //       }
    //     );
    res.send({
      message: "reset email has been sent successfully",
      type: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      type: "error",
      message: "Your request has been declined. Please try again",
    });
  }
};
//user -reset password
exports.user_reset_password = async (req, res) => {
  try {
    const { password } = req.body;
    if (req.query.token) {
      const validToken = jwt.verify(
        req.query.token,
        process.env.JWT_RESET_PASSWORD
      );
      if (!validToken) {
        return res
          .status(404)
          .send({ type: "error", message: "Invalid! Please try again" });
      }
      const user = await User.findOne({ _id: validToken._id });
      if (!user) {
        return res
          .status(404)
          .send({ type: "error", message: "Invalid! Please try again" });
      }
      user.password = password;
      await user.save();
      res.send(user);
    }
  } catch (error) {
    res.status(500).send({ error, type: "error" });
  }
};
//user - facebook login
exports.user_facebook_login = async (req, res) => {
  try {
    const {
      email,
      name,
      picture: {
        data: { url },
      },
    } = req.body;
    const user = await User.findOne({ email });
    const userAvatar = {
      image: url,
      zoom: "100%",
    };
    if (user) {
      (user.avatar.image = url), user.avatars.unshift(userAvatar);
      await user.save();
      const token = await user.generateToken();
      res.cookie("token", token);
      return res.send({
        type: "success",
        token,
        user,
        message: "You have successfully logged in!",
      });
    } else {
      res.status(404).send({
        message:
          "You do not have acccount with us. Please go register page and create account",
      });
    }
  } catch (error) {
    res.status(500).send({
      type: "error",
      message: "Your request has been declined. Please try again",
    });
  }
};
//user - Google login
exports.user_google_login = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const idToken = req.body.tokenId;
    const response = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email, jti, picture } = response.payload;
    if (email_verified) {
      const user = await User.findOne({ email });
      const userAvatar = {
        image: picture,
        zoom: "100%",
      };
      if (user) {
        user.avatar.image = picture;
        user.avatar.zoom = 100;
        user.avatars.unshift(userAvatar);
        user.registerStatus = false;
        await user.save();
        const token = await user.generateToken();
        res.cookie("token", token);
        return res.send({
          token,
          user,
          message: "You have successfully logged in!",
        });
      } else if (!user) {
        const password = process.env.GOOGLE_PASSWORD;
        const user = new User({ email, name, password });
        user.avatar.image = picture;
        user.avatar.zoom = 100;
        user.avatars.unshift(userAvatar);
        randomNumber = Math.floor(Math.random() * (20000 * 30000));
        user.userName =
          name.toLowerCase().trim().replace(/\s/g, "") + randomNumber;
        const token = await user.generateToken();
        user.userId = exportIdGenerator(20);
        await user.save();
        res.status(201).send({
          type: "success",
          user,
          token,
          message: "You have successfully logged in!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      type: "error",
      message: "Your request has been declined. Please try again",
    });
  }
};

//user - get user(Self)
exports.user_info_auth = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};
//user - edit user
exports.user_update = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "mobile", "phoneCode", "language", "value"];
  if (req.body.name) {
    userRealName =
      req.body.name.toLowerCase().charAt(0).toUpperCase() +
      req.body.name.slice(1);
  }
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send("Invalid udpate");
  }

  try {
    await updates.map((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
//user - change email
exports.user_change_email = async (req, res) => {
  try {
    const match = req.user.email === req.body.oldEmail;
    if (!match) {
      return res.status(400).send({ message: "Please verify email" });
    }
    const isMatch = await bcrypt.compare(req.body.password, req.user.password);
    if (!isMatch)
      return res
        .status(400)
        .send({ message: "Please verify your email and password" });
    req.user.email = req.body.newEmail;
    await req.user.save();
    res.send(req.user);
  } catch (error) {}
};

//user - change password
exports.user_change_password = async (req, res) => {
  try {
    const match = req.user.email === req.body.email;
    if (!match) {
      return res.status(400).send({ message: "Please verify email" });
    }
    const isMatch = await bcrypt.compare(
      req.body.oldPassword,
      req.user.password
    );
    if (!isMatch)
      return res
        .status(400)
        .send({ message: "Please verify your email and password" });
    req.user.password = req.body.newPassword;
    await req.user.save();
    res.send(req.user);
  } catch (error) {}
};

//user - username exist validation
exports.user_username_exist_check = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.oldusername });
    if (user.userName != req.user.userName) {
      return res.status(404).send({ message: "Please check your username" });
    }
    let usernames = req.body.newusername
      .toLowerCase()
      .trim()
      .replace(/\s/g, "");
    const userexist = await User.findOne({ userName: usernames });
    if (userexist) {
      return res.status(404).send({ message: "username already exist" });
    }
    req.user.userName = usernames;

    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
};
//user - signout
exports.user_logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.clearCookie("token");
    res.send({ message: "Logout sucessfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
//user - signout all session
exports.user_logout_all = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.clearCookie("token");
    res.send({ message: "Logout sucessfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
//user - edit avatar
exports.user_add_avatar = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const profileAvatar = {
      image: req.file.location,
      zoom: req.query.zoom || "100%",
    };
    user.avatars.unshift(profileAvatar);
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};
//user - email verification request

exports.user_email_verification_request = async (req, res) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    req.user.emailOTP = otp;
    var ses = require("node-ses"),
      client = ses.createClient({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SCECRET_KEY,
      });
    client.sendEmail(
      {
        cc: [`${req.user.email}`],
        from: process.env.SESFROMMAIL,
        subject: "OTP Verfication",
        message: `   <p>Hi ,</p> <br/>
          <p>${otp}.</p> </br>
          <br/>
          <br/>
          <p>Do not share your OTP with anyone including Fivestarweek staff</p>
          <br/>
          <br/>
          <p>For any OTP related query please email us at info@fivestarweek.com</p>
          <br/>
          <p>Regards,</p>
          <br/>
          <p>Fivestarweek team</p>
          `,
        altText: "plain text",
      },
      function (err, data, res) {}
    );
    await req.user.save();
    res.send({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
//email verificaiton
exports.user_email_verify = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
      isEmailVerified: false,
    });
    if (user.emailOTP == req.body.otp) {
      user.isEmailVerified = true;
    } else {
      return res.status(404).send("Please check your otp and try again");
    }
    await user.save();
    res.send({ message: "Your email has been verified successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//user - phone verification
