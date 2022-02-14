/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var path_ = require('path');
var fs_   = require('fs');

// TODO: take from command line
globalThis.FOAM_FLAGS = {
  'java':    true,
  'genjava': true,
  'node':    true,
  'debug':   true,
  'js':      false,
  'swift':   false
};

// TODO: take from command line
require('../src/foam_node.js');
require('../src/foam/nanos/nanos.js');
require('../src/foam/support/support.js');

//require('../../interac/src/net/nanopay/interac/files.js');

// TODO: clean this up, shouldn't be required
globalThis.foam.flags.src = '../../nanopay/src/';

require('../../nanopay/src/net/nanopay/files.js');
require('../../nanopay/src/net/nanopay/iso8583/files.js');
require('../../nanopay/src/net/nanopay/flinks/utils/files.js');
require('../../nanopay/src/net/nanopay/fx/ascendantfx/model/files.js');
require('../../nanopay/src/net/nanopay/kotak/model/paymentResponse/files.js');
require('../../nanopay/src/net/nanopay/kotak/model/reversal/files.js');
require('../../nanopay/src/net/nanopay/kotak/model/paymentRequest/files.js');
require('../../nanopay/src/net/nanopay/partner/scotiabank/api/files.js');
require('../../nanopay/src/net/nanopay/iso20022/files.js');

var srcPath = __dirname + "/../src/";

if ( process.argv.length < 4 || process.argv.length > 6 ) {
  console.log("USAGE: genjava.js input-path output-path src-path(optional) files-to-update(optional)");
  process.exit(1);
}

if ( process.argv.length > 4 && process.argv[4] !== '--' ) {
  srcPath = process.argv[4];
  if ( ! srcPath.endsWith('/') ) {
    srcPath = srcPath + '/';
  }
}

var indir  = path_.resolve(path_.normalize(process.argv[2])); // TODO: not used
var outdir = path_.resolve(path_.normalize(process.argv[3]));

function maybeGenerateJava(c) {
  if ( ! c.model_.flags || c.model_.flags.includes('java') ) {
    var javaClass = c.buildJavaClass ? c.buildJavaClass() : c;

    var c2 = foam.maybeLookup(javaClass.id);
    c2.model_.targetJava(outdir);
  }
}

// TODO: create a foam.MODELS to avoid this
for ( var key in foam.UNUSED ) try { foam.lookup(key); } catch(x) { }

for ( var key in foam.USED ) {
  try {
    var c = foam.lookup(key);
    maybeGenerateJava(c);
  } catch(x) {}
}
