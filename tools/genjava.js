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
  {
    d:             './build/classes/java/main', // TODO: build/classes should be sufficient, but doesn't work with rest of build
    javacParams:   '--release 11',
    repo:          'http://repo.maven.apache.org/maven2/', // should be https?
    buildlib:      false,
    libdir:        './build/lib',
    outdir:        '/build/src/java',
    pom:           'pom'
  },
  {
    genjava: true,
    java:    true,
    javac:   false,
    verbose: false
  }
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

if ( ! flags.javac ) return;

// console.log(X.javaFiles);
// console.log(foam.poms);

var fs_   = require('fs');
var exec_ = require('child_process');
var found = 0;


function verbose() {
  if ( flags.verbose ) console.log.apply(console, arguments);
}


function matchJavaSources(pom, f, isDir) {
  var javaSources = pom.pom.javaSources;
  if ( ! javaSources ) return true;
  f = f.substring(pom.location.length);
  for ( var i = 0 ; i < javaSources.length ; i++ ) {
    var pattern = javaSources[i];
    if ( pattern.startsWith('-') ) {
      pattern = pattern.substring(1);
      if ( isDir ) {
        if ( f.startsWith(pattern) ) return false;
      } else {
        if ( f.endsWith(pattern) ) return false;
      }
    } else {
      if ( isDir ) {
        if ( f.startsWith(pattern) ) return true;
      } else {
        if ( f.endsWith(pattern) ) return true;
      }
    }
  }
  return false;
}

function processDir(pom, location, skipIfHasPOM) {
  verbose('\tdirectory:', location);
  var files = fs_.readdirSync(location, {withFileTypes: true});

  if ( skipIfHasPOM && files.find(f => f.name.endsWith('pom.js')) ) return;

  files.forEach(f => {
    var fn = location + '/' + f.name;
    if ( f.isDirectory() && ! f.name.startsWith('.') ) {
      if ( f.name.indexOf('android') != -1 ) return false;
      if ( f.name.indexOf('examples') != -1 ) return false;
      if ( matchJavaSources(pom, fn, true) )
        processDir(pom, fn, true);
    } else if ( f.name.endsWith('.java') ) {
      if ( matchJavaSources(pom, fn, false) ) {
        verbose('\t\tfile:', fn);
        found++;
        X.javaFiles.push(fn);
      }
    }
  });
}

var http_ = require('http');

function download(url, dest, cb) {
  var file    = fs_.createWriteStream(dest);
  var request = http_.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs_.unlink(dest); // Delete the file async. (But we don't check the result)
    cb && cb(err.message);
  });
};

function loadLibs(pom) {
  // To be useful, it would also need to download the library's POM and then download
  // it's dependendencies. Better to let Maven do that.
  pom.pom.javaDependencies && pom.pom.javaDependencies.forEach(d => {
    var a   = d.split(':');
    var filename =  a[1] + '-' + a[2] + '.jar';
    var url = X.repo + a[0].replaceAll('.', '/') + '/' + a[1] + '/' + a[2] + '/' + filename;
    console.log('[GENJAVA] Downloading', url);
    download(url, X.libdir + '/' + filename, e => {
      if ( e ) {
        console.log('[GENJAVA] Error Downloading', filename);
      } else {
        console.log('[GENJAVA] Downloaded', filename);
      }
    });
  });
}

if ( X.buildlib && ! fs_.existsSync(X.libdir) ) fs_.mkdirSync(X.libdir, {recursive: true});

var seen = {};
function processPOM(pom) {
  if ( seen[pom.location] ) return;
  if ( X.buildlib ) loadLibs(pom);
  seen[pom.location] = true;
  verbose('GENJAVA: Scanning POM for java files:', pom.location);
  processDir(pom, pom.location, false);
}

foam.poms.forEach(processPOM);
console.log(`GENJAVA: Found ${found} java files.`);

//console.log(X.javaFiles);
fs_.writeFileSync('javaFiles', X.javaFiles.join('\n') + '\n');

if ( ! fs_.existsSync(X.d) ) fs_.mkdirSync(X.d, {recursive: true});

var cmd = `time javac -parameters ${X.javacParams} -d ${X.d} -classpath "${X.d}:./target/lib/*:./foam3/android/nanos_example_client/gradle/wrapper/gradle-wrapper.jar" @javaFiles`;

console.log('GENJAVA Compiling:', cmd);
exec_.exec(cmd, [], (error, stdout, stderr) => {
  console.log('GENJAVA Finished Compiling');
  if ( error ) console.log(error);
  console.log(stdout);
  console.log(stderr);
});


// console.log('************ PROCESS', process.env);
