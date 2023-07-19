/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var pCount = 0, fCount = 0;

exports.visitPOM = function(pom) {
  console.log('[Verbose Maker] POM:', pom.location);
  pCount++;
}

exports.visitFile = function(pom, f, fn) {
  console.log('[Verbose Maker] File:', f.name);
  fCount++;
}

exports.end = function() {
  console.log(`[Verbose Maker] POM Count: ${pCount}, File Count: ${fCount}`);
}
