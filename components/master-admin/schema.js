const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");

const connection = mongoose.createConnection(`${process.env.DATABASE}`, {
  useNewUrlParser: true,
});
process.env.DATABASE;
const Schema = mongoose.Schema;

const MasterPublisherSchema = new Schema(
  {
    userId: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: [isEmail, "invalid email"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      trim: true,
    },
    isPhoneVerified: {
      type: Boolean,
      trim: true,
      default: false,
    },

    emailOTP: {
      type: Number,
      trim: true,
    },

    avatars: [],
    mobile: {
      type: String,
      default: "9000000000",
    },
    phoneCode: {
      type: String,
      default: "91",
    },
    resetPassword: {
      type: String,
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "BLOCKED"],
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
MasterPublisherSchema.pre("save", async function (next) {
  //encrypt password
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  // email small letter
  user.email = user.email.toLowerCase();
  next();
});

//generate token for authentication
MasterPublisherSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_VARIABLE
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
//hide password and tokens array
MasterPublisherSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.resetPassword;
  delete userObject.emailOTP;
  return userObject;
};
const MasterPublisher = connection.model(
  "MasterPublisher",
  MasterPublisherSchema
);

module.exports = MasterPublisher;
