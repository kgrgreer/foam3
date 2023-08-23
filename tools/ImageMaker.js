/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

exports.description = 'Copies image/* files into /target/images';

const b_ = require('./buildlib');

exports.init = function() {
  X.imagedir = X.builddir + '/images';
  b_.ensureDir(X.imagedir);
}


exports.visitDir = function(pom, f, fn) {
  if ( f.name === 'images' ) {
    console.log(`[Image Maker] Copying ${fn} to ${X.imagedir}`);
    b_.copyDir(fn, X.imagedir);
  }
}
