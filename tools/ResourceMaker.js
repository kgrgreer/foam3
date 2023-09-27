/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

exports.description = 'Copies resource/* files into /build/journals';

const b_ = require('./buildlib');

exports.init = function() {
  X.resourcedir = X.builddir + '/journals/';
  b_.ensureDir(X.resourcedir);
}


exports.visitDir = function(pom, f, fn) {
  if ( f.name === 'resources' ) {
    console.log(`[Resource Maker] Copying ${fn} to ${X.resourcedir}`);
    b_.copyDir(fn, X.resourcedir);
  }
}
