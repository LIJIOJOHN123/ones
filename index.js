const app = require("./app");
const cluster = require("cluster");
const os = require("os");
const numCpu = os.cpus().length;
PORT = process.env.PORT || 3001;

app.listen(8000, () => {
  console.log("You app is running port " + 8000);
});
