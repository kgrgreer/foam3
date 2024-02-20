/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// JSMaker

exports.description = 'Copy resources into the webroot directory.';

const fs_   = require('fs');
const path_ = require('path');
const b_    = require('./buildlib');

exports.init = function() {
  X.webrootdir = X.builddir + '/webroot';
  b_.ensureDir(X.webrootdir);
}


exports.visitPOM = function(pom) {
  pom.webroot && pom.webroot.forEach(fn => {
    var r = path_.resolve(foam.cwd, fn);

    if ( fs_.lstatSync(r).isDirectory() ) {
      console.log(`[Webroot Maker] Copying Directory ${r} to ${X.webrootdir}`);
      b_.copyDir(r, path_.resolve(X.webrootdir, fn));
    } else {
      console.log(`[Webroot Maker] Copying File ${r} to ${X.webrootdir}`);
      b_.ensureDir(path_.dirname(X.webrootdir + '/' + fn));
      b_.copyFile(r, X.webrootdir + '/' + fn);
    }
  });
}
