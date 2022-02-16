/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: catch syntax errors

process.on('unhandledRejection', function(e) {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});


var path_ = require('path');

var flags = globalThis.FOAM_FLAGS = {
  java: true, genjava: true, node: true, debug: true
};

require('../src/foam_node.js');

//////////////////////////////////////////////////// Process Command-Line Args

var argv = process.argv.slice(2);

// Flags
if ( argv.length && argv[0].startsWith('-flags=') ) {
  argv.shift().substring(7).split(',').forEach(f => {
    if ( f.startsWith('-') ) {
      flags[f.substring(1)] = false;
    } else {
      flags[f] = true;
    }
  });
}

if ( ! process.argv.length ) {
  console.log("USAGE: genjava.js [ -flags=[-]flag,...,[-]flag ] output-path sourcefiles*");
  process.exit(1);
}

// Output Directory
var outdir = path_.resolve(path_.normalize(argv.shift()));

// Manifest (files.js) Files
argv.forEach(fn => {
  flags.src = fn.substring(0, fn.indexOf('/src/')+5);
  require(fn);
});


//////////////////////////////////////////////////// Create Java Output

// Promote all UNUSED Models to USED
for ( var key in foam.UNUSED ) try { foam.maybeLookup(key); } catch(x) { }

// Build Java Classes
for ( var key in foam.USED ) try {
  foam.maybeLookup(key).model_.targetJava(outdir);
} catch(x) {}
