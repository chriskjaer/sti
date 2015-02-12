"use strict";

module.exports = stdout;
function stdout(audit, options) {
  var level = options.level;
  level = level ? level : "log";
  console[level](audit);
}
