/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

console.log('START GENJAVA');

const startTime = Date.now();
var path_       = require('path');

require('../src/foam_node.js');

var [argv, X, flags] = require('./processArgs.js')(
  '',
  { outdir: '/build/src/java', pom: 'pom' },
  { java: true, genjava: true }
);

X.outdir    = path_.resolve(path_.normalize(X.outdir));
X.javaFiles = [];

foam.require(X.pom, false, true);

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

console.log(`END GENJAVA: ${jCount}/${mCount} models processed, ${X.javaFiles.length} Java files created in ${Math.round((Date.now()-startTime)/1000)}s.`);

/*
console.log(X.javaFiles);
console.log(foam.poms);

var fs_   = require('fs');
var exec_ = require('child_process');
var found = 0;

function matchJavaSources(pom, f) {
  if ( f.name.indexOf("AmazonS3") != -1 ) return false;
  if ( f.name.endsWith('build') ) return false; // temporary
  return true;
    // return ! pom.javaSources;
}

function processDir(pom, location, skipIfHasPOM) {
  console.log('\tdirectory:', location);
  var files = fs_.readdirSync(location, {withFileTypes: true});

  if ( skipIfHasPOM && files.find(f => f.name.endsWith('pom.js')) ) return;

  files.forEach(f => {
    var fn = location + '/' + f.name;
    if ( f.isDirectory() && ! f.name.startsWith('.') ) {
      if ( f.name.indexOf('android') != -1 ) return false;
      if ( f.name.indexOf('examples') != -1 ) return false;
      processDir(pom, fn, true);
    } else if ( f.name.endsWith('.java') ) {
      if ( matchJavaSources(pom, f) ) {
        console.log('\t\tfile:', fn);
        found++;
        X.javaFiles.push(fn);
      }
    }
  });
}

var seen = {};
function processPOM(pom) {
  if ( seen[pom.location] ) return;
  seen[pom.location] = true;
  console.log('GENJAVA: Scanning POM for java files:', pom.location);
  processDir(pom, pom.location, false);
}

foam.poms.forEach(processPOM);
console.log(`GENJAVA: Found ${found} java files.`);

console.log(X.javaFiles);
fs_.writeFileSync('javaFiles', X.javaFiles.join('\n') + '\n'
);
var cmd = `javac -parameters -verbose --release 11 -d ./build/classes -classpath "./target/lib/*:./foam3/android/nanos_example_client/gradle/wrapper/gradle-wrapper.jar" @javaFiles`;
console.log('GENJAVA Executing:', cmd);
exec_.exec(cmd, [], (error, stdout, stderr) => {
  if ( error ) {
    console.log(error);
  }
  console.log(stdout);
  console.log(stderr);
});

console.log('************ PROCESS', process.env);
*/
