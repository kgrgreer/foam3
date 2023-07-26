/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// JavaMaker

const fs_   = require('fs');
const path_ = require('path');
const { processArgs } = require('./buildlib');


exports.description = 'generates .java files from .js models';

exports.args = [
  {
    // Isn't used directly by this Maker, but is used in java/refinements.js
    name: 'outdir',
    description: 'location to write generated .java files, default: {builddir}/src/java',
    factory: () => path_.resolve(path_.normalize(X.outdir || (X.builddir + '/src/java')))
  }
];


exports.init = function() {
  processArgs(X, exports.args);
  // Turns on loading of foam/java/* models needed for java code generation.
  flags.genjava   = true;
  flags.loadFiles = true;
}


exports.end = function() {
  // Promote all UNUSED Models to USED
  // 2 passes in case interfaces generated new classes in 1st pass
  for ( var i = 0 ; i < 2 ; i++ )
    for ( var key in foam.UNUSED )
      try { foam.maybeLookup(key); } catch(x) { }

  var mCount = 0, jCount = 0;

  // Build Java Classes
  for ( var key in foam.USED ) try {
    mCount++;
    if ( foam.maybeLookup(key).model_.targetJava(X) ) {
      jCount++;
    }
  } catch(x) {}

  console.log(`[Java]: ${jCount}/${mCount} models processed.`);
}
