/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// VerboseMaker

exports.description = 'print out information about POMs and files visited';

exports.args = [
  {
    name: 'showFiles',
    description: 'enable showing of processed files',
    value: false
  }
];

var pCount = 0, fCount = 0, depth = 0;

exports.visitPOM = function(pom) {
  depth++;
  console.log('[Verbose] POM:', ''.padEnd(depth*4) + foam.cwd);
  pCount++;
}

exports.endVisitPOM = function(pom) {
  depth--;
}

exports.visitFile = function(pom, f, fn) {
  if ( ! X.showFiles ) return;
  console.log('[Verbose] File:', ''.padEnd(depth*4) + f.name);
  fCount++;
}

exports.end = function() {
  console.log(`[Verbose] POM Count: ${pCount}, File Count: ${fCount}`);
}
