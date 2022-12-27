const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const helmet = require("helmet");
var compression = require("compression");
require("dotenv").config();

//require("./config/catche")

const app = express();
app.use(compression());
app.use(helmet());

app.use(express.json());
app.use(cors());

//db connection

//router

const user_routers = require("./components/user/router");
const master_publisher_routers = require("./components/master-publisher/router");
const master_admin_routers = require("./components/master-admin/router");

app.use("/api/user", user_routers);
app.use("/api/master_publisher", master_publisher_routers);
app.use("/api/master_admin", master_admin_routers);

//user

module.exports = app;
