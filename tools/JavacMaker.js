/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const fs_   = require('fs');
const exec_ = require('child_process');

const javaFiles = [];

exports.visitPOM = function(pom) {
  console.log('[Java Maker] VISIT POM', pom.location);
}

exports.visitFile = function(pom, f, fn) {
  if ( f.name.endsWith('.java') ) {
    if ( ! isExcluded(pom, fn) ) {
      verbose('\t\tjava source:', fn);
      javaFiles.push(fn);
    }
  }
}

exports.end = function() {
  console.log(`[Java Maker] END ${javaFiles.length} Java files`);

  // Only overwrite javaFiles when genjava:true
  // TODO: should move to separate genjava visitor
  if ( flags.genjava )
    fs_.writeFileSync(X.builddir + '/javacfiles', javaFiles.join('\n') + '\n');

  if ( ! fs_.existsSync(X.d) ) fs_.mkdirSync(X.d, {recursive: true});

  var cmd = `javac -parameters ${X.javacParams} -d ${X.d} -classpath "${X.d}:${X.libdir}/*" @${X.builddir}/javacfiles`;

  console.log('[Java Maker] Compiling', javaFiles.length ,'java files:', cmd);
  try {
    exec_.execSync(cmd, {stdio: 'inherit'});
  } catch(x) {
    process.exit(1);
  }
}
