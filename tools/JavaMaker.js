/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 const fs_   = require('fs');
 const path_ = require('path');


exports.description = 'generates .java files from .js models';

exports.args = [
  {
    // Isn't used directly by this Maker, but is used in java/refinements.js
    name: 'outdir',
    description: 'location to write generated .java files, default: {builddir}/src/java',
    factory: () => path_.resolve(path_.normalize(X.outdir || (X.builddir + '/src/java')))
  }
];

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

  console.log(`[GenJava Maker]: ${jCount}/${mCount} models processed.`);
}
