/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

exports.description = 'copies .flow files into /build/documents';

const fs_          = require('fs');
const { copyFile, ensureDir, isExcluded } = require('./buildlib');

const documentFiles  = [];

exports.init = function() {
  X.documentdir = X.builddir + '/documents/';
  ensureDir(X.documentdir);
}


exports.visitFile = function(pom, f, fn) {
  if ( f.name.endsWith('.flow') ) {
    if ( ! isExcluded(pom, fn) ) {
      verbose('\t\tdocument source:', fn);

      var i            = fn.lastIndexOf('/');
      var documentName = fn.substring(i+1);

      copyFile(fn, X.documentdir + documentName);
      documentFiles.push(fn);
    }
  }
}


exports.end = function() {
  // Write to document_files for verification purpose
  fs_.writeFileSync(X.builddir + '/document_files', documentFiles.join('\n') + '\n');

  console.log(`[Doc Maker] Copied ${documentFiles.length} flow document files to ${X.documentdir}.`);
}
