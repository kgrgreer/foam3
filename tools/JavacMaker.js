/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const fs_   = require('fs');
const exec_ = require('child_process');
const b_    = require('./buildlib');

X.javaFiles = [];

exports.visitFile = function(pom, f, fn) {
  if ( f.name.endsWith('.java') ) {
    if ( ! b_.isExcluded(pom, fn) ) {
      verbose('\t\tjava source:', fn);
      X.javaFiles.push(fn);
    }
  }
}

exports.end = function() {
  console.log(`[Javac Maker] END ${X.javaFiles.length} Java files`);

  // Only overwrite X.javaFiles when genjava:true
  // TODO: should move to separate genjava visitor
  if ( flags.genjava )
    fs_.writeFileSync(X.builddir + '/javacfiles', X.javaFiles.join('\n') + '\n');

  if ( ! fs_.existsSync(X.d) ) fs_.mkdirSync(X.d, {recursive: true});

  var cmd = `javac -parameters ${X.javacParams} -d ${X.d} -classpath "${X.d}:${X.libdir}/*" @${X.builddir}/javacfiles`;

  console.log('[Javac Maker] Compiling', X.javaFiles.length ,'java files:', cmd);
  try {
    b_.execSync(cmd, {stdio: 'inherit'});
  } catch(x) {
    process.exit(1);
  }
}
