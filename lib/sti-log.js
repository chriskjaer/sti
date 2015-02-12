"use strict";
module.exports = log;
var createWriteStream = require("fs").createWriteStream;
var resolve = require("path").resolve;
function log(path) {
  var file = path ? resolve(path, "sti-" + Date.now() + ".log") : resolve(process.cwd(), "log", "sti-" + Date.now() + ".log");

  var stream = createWriteStream(resolve(file)).on("error", function (error) {
    return console.error(error);
  });

  return function (audit) {
    stream.write(JSON.stringify(audit) + "\n");
  };
}
