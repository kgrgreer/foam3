/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var path_            = require('path');
var [argv, X, flags] = require('./processArgs.js')(
  'sourcefiles*',
  { outdir: '/build/src/java' },
  { java: true, genjava: true, node: true, debug: true }
);

X.outdir = path_.resolve(path_.normalize(X.outdir));

require('../src/foam_node.js');

// Load Manifest (files.js) Files
argv.forEach(fn => {
  flags.src = fn.substring(0, fn.indexOf('/src/')+5);
  require(fn);
});

// Promote all UNUSED Models to USED
for ( var key in foam.UNUSED ) try { foam.maybeLookup(key); } catch(x) { }
// Call a 2nd time incase interfaces generated new classes in the 1st pass
for ( var key in foam.UNUSED ) try { foam.maybeLookup(key); } catch(x) { }


// Build Java Classes
for ( var key in foam.USED ) try {
  foam.maybeLookup(key).model_.targetJava(X);
} catch(x) {}
