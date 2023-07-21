/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

exports.description = 'generates .java files from .js models';

const fs_   = require('fs');
const path_ = require('path');

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
