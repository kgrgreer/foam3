/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

console.log('START GENJAVA');

const startTime = Date.now();
var path_       = require('path');

require('../src/foam_node.c');

var [argv, X, flags] = require('./processArgs.c')(
  '',
  { outdir: '/build/src/java', pom: 'pom' },
  { java: true, genjava: true }
);

X.outdir = path_.resolve(path_.normalize(X.outdir));

foam.require(X.pom, false, true);

// Promote all UNUSED Models to USED
for ( var key in foam.UNUSED ) try { foam.maybeLookup(key); } catch(x) { }
// Call a 2nd time in case interfaces generated new classes in the 1st pass
for ( var key in foam.UNUSED ) try { foam.maybeLookup(key); } catch(x) { }

var mCount = 0, jCount = 0;
// Build Java Classes
for ( var key in foam.USED ) try {
  mCount++;
  if ( foam.maybeLookup(key).model_.targetJava(X) )
    jCount++;
} catch(x) {}

console.log(`END GENJAVA: ${jCount}/${mCount} models processed in ${Math.round((Date.now()-startTime)/1000)}s.`);
