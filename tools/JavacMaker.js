/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// JavacMaker

exports.description = 'create /build/javacfiles file containing list of modified or static .java files, call javac';

exports.args = [
  {
    name: 'javacParams',
    description: 'parameters to pass to javac',
    value: '--release 11'
  }
];


const fs_                                   = require('fs');
const { execSync, isExcluded, processArgs } = require('./buildlib');

exports.init = function() {
  processArgs(X, exports.args);

  X.javaFiles = [];
}


exports.visitFile = function(pom, f, fn) {
  if ( f.name.endsWith('.java') ) {
    if ( ! isExcluded(pom, fn) ) {
      verbose('\t\tjava source:', fn);
      X.javaFiles.push(fn);
    }
  }
}


exports.end = function() {
  console.log(`[Javac] END ${X.javaFiles.length} Java files`);

  fs_.writeFileSync(X.builddir + '/javacfiles', X.javaFiles.join('\n') + '\n');

  if ( ! fs_.existsSync(X.d) ) fs_.mkdirSync(X.d, {recursive: true});

  var cmd = `javac -parameters ${X.javacParams} -d ${X.d} -classpath "${X.d}:${X.libdir}/*" @${X.builddir}/javacfiles`;

  console.log('[Javac] Compiling', X.javaFiles.length ,'java files:', cmd);
  try {
    execSync(cmd, {stdio: 'inherit'});
  } catch(x) {
    process.exit(1);
  }
}
