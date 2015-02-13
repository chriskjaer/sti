'use strict';

import through from 'through';
import { Readable, Transform } from 'stream';

class AuditMerger extends Transform {
  constructor( defaultAudit, isWriteableStream ) {
    super({ objectMode: true });
    this.defaultAudit = defaultAudit;
    this._isWritableStream = isWriteableStream;
  }

  _transform(chunck, encoding, done) {
    let audit = Object.assign(chunck, this.defaultAudit );
    if (this._isWritableStream) {
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
    const isWriteableStream = typeof action.on === 'function' && action.writable;
    const mergedStream = this.stream.pipe(
      new AuditMerger(defaultAudit, isWriteableStream)
    );

    if ( isWriteableStream ) {
      mergedStream.pipe( action );
    }

    else if ( typeof action === 'function' ) {
      mergedStream.pipe( through(action) );
    }

    else {
      throw new TypeError('sti.connect only accepts functions or writeable streams');
    }
  }
}
