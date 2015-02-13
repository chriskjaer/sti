"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var through = _interopRequire(require("through"));

var _stream = require("stream");

var Readable = _stream.Readable;
var Transform = _stream.Transform;
var AuditMerger = (function (Transform) {
  function AuditMerger(defaultAudit, isWriteableStream) {
    _classCallCheck(this, AuditMerger);

    _get(Object.getPrototypeOf(AuditMerger.prototype), "constructor", this).call(this, { objectMode: true });
    this.defaultAudit = defaultAudit;
    this._isWritableStream = isWriteableStream;
  }

  _inherits(AuditMerger, Transform);

  _prototypeProperties(AuditMerger, null, {
    _transform: {
      value: function _transform(chunck, encoding, done) {
        var audit = Object.assign(chunck, this.defaultAudit);
        if (this._isWritableStream) {
          this.push(JSON.stringify(audit) + "\n");
        } else {
          this.push(audit);
        }

        done();
      },
      writable: true,
      configurable: true
    }
  });

  return AuditMerger;
})(Transform);

var Sti = (function () {
  function Sti(str) {
    _classCallCheck(this, Sti);

    this.name = str;
    this.stream = new Readable({ objectMode: true });
    this.stream._read = function () {};
  }

  _prototypeProperties(Sti, null, {
    audit: {
      value: function audit(audit) {
        var actor = audit.actor;
        var target = audit.target;
        var data = audit.data;
        var action = audit.action;
        // TODO: Sanitize string
        var payload = Object.seal({
          timestamp: new Date().toISOString(),
          area: this.name,
          actor: actor,
          action: action,
          target: target,
          data: data
        });

        this.stream.push(payload);
      },
      writable: true,
      configurable: true
    },
    connect: {
      value: function connect(action, defaultAudit) {
        var isWriteableStream = typeof action.on === "function" && action.writable;
        var mergedStream = this.stream.pipe(new AuditMerger(defaultAudit, isWriteableStream));

        if (isWriteableStream) {
          mergedStream.pipe(action);
        } else if (typeof action === "function") {
          mergedStream.pipe(through(action));
        } else {
          throw new TypeError("sti.connect only accepts functions or writeable streams");
        }
      },
      writable: true,
      configurable: true
    }
  });

  return Sti;
})();

module.exports = Sti;
