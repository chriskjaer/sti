'use strict';

import Sti from './src';
import fs from 'fs';

// Create a sti
const sti = new Sti('example-sti');



// Sti can connect to a writable stream
const stream = fs.createWriteStream('./log/test.log');
sti.connect( stream );



// ...or the built in writable streams
sti.connect( process.stdout, { target: 'default-data' } );




// Or use a custom function that will be called on every audit.
sti.connect( function(audit) {
  /* ...connect to something here... */
}, { action: 'default-audit-data' });




// Make an audit. All listeners will receive this audit
sti.audit({
  actor: '2321434',
  target: '2e12ff2',
  action: 'changed-email',
  data: {
    before: 'foo@test.com',
    after: 'bar@test.com'
  }
});
