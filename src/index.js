'use strict';

import through from 'through';
import { Readable, Transform } from 'stream';

class AuditMerger extends Transform {
  constructor( defaultAudit, isStream ) {
    super({ objectMode: true });
    this.defaultAudit = defaultAudit;
    this._isStream = isStream;
  }

  _transform(chunck, encoding, done) {
    let audit = Object.assign(chunck, this.defaultAudit );
    if (this._isStream) {
      this.push(JSON.stringify(audit) + '\n');
    }
    else {
      this.push(audit);
    }

    done();
  }
}

export default class Sti {
  constructor( str ) {
    this.name = str;
    this.stream = new Readable({ objectMode: true });
    this.stream._read = function() {};
  }

  audit( audit ) {
    const { actor, target, data } = audit;
    let { action } = audit; // TODO: Sanitize string
    let payload = Object.seal({
      timestamp: new Date().toISOString(),
      area: this.name,
      actor,
      action,
      target,
      data
    });

    this.stream.push(payload);
  }

  connect(action, defaultAudit) {
    let isStream = typeof action !== 'function';
    let mergedStream = this.stream.pipe( new AuditMerger(defaultAudit, isStream) );

    if ( isStream) {
      mergedStream.pipe( action );
    }

    else {
      mergedStream.pipe( through(action) );
    }
  }
}
