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
    journaldir:    './target/journals/',
    libdir:        './build/lib',
    outdir:        '/build/src/java',
    pom:           'pom'
  },
  {
    buildlib:      false,
    buildjournals: false,
    genjava:       true,
    java:          true,
    javac:         false,
    verbose:       false
  }
);

X.outdir        = path_.resolve(path_.normalize(X.outdir));
X.javaFiles     = [];
X.journalFiles  = [];
X.journalOutput = {};

X.pom.split(',').forEach(pom => foam.require(pom, false, true));

// If genjava is disabled, then override foam.loadFiles so that the POM
// structure is loaded but .js files aren't.
if ( ! flags.genjava ) {
  foam.loadFiles = function() {};
}


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

const fs_   = require('fs');
const exec_ = require('child_process');

var found = 0;


function verbose() {
  if ( flags.verbose ) console.log.apply(console, arguments);
}


function isExcluded(pom, f) {
  var ex = pom.pom.excludes;
  if ( ! ex ) return false;
  for ( var i = 0 ; i < ex.length ; i++ ) {
    var p = ex[i];
    if ( p.endsWith('*') ) p = p.substring(0, p.length-1);

    if (
      f.endsWith(p) ||
      ( f.endsWith('.js') && f.substring(0, f.length-3).endsWith(p) ) )
    {
      return true;
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
      if ( f.name.indexOf('android') != -1 ) return;
      if ( f.name.indexOf('examples') != -1 ) return;
        if ( ! isExcluded(pom, fn) ) processDir(pom, fn, true);
    } else if ( f.name.endsWith('.java') ) {
      if ( ! isExcluded(pom, fn) ) {
        verbose('\t\tjava source:', fn);
        found++;
        X.javaFiles.push(fn);
      }
    } else if ( f.name.endsWith('.jrl') ) {
      verbose('\t\tjournal source:', fn);
      addJournal(fn);
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


// TODO: move to common library
function ensureDir(dir) {
  if ( ! fs.existsSync(dir) ) {
    console.log('Creating directory', dir);
    fs.mkdirSync(dir, {recursive: true});
  }
}


if ( X.buildlib      ) ensureDir(X.libdir);
if ( X.buildjournals ) ensureDir(X.journaldir);


function addJournal(fn) {
  X.journalFiles.push(fn);
  if ( ! flags.buildjournals ) return;
  var i           = fn.lastIndexOf('/');
  var journalName = fn.substring(i+1, fn.length-4);
  var file        = fs_.readFileSync(fn).toString();

  if ( ! file.length ) return;

  file = `// The following ${(file || '').split('\n').length} lines were copied from "${path_.relative(process.cwd(), fn)}"\n` + file + '\n';
  X.journalOutput[journalName] = (X.journalOutput[journalName] || '') + file;
}

function outputJournals() {
  if ( ! flags.buildjournals ) return;

  if ( fs_.existsSync(X.journaldir) ) {
    fs_.readdirSync(X.journaldir).forEach(f => fs_.rmSync(`${X.journaldir}/${f}`));
  } else {
    fs_.mkdirSync(X.journaldir, {recursive: true});
  }

  Object.keys(X.journalOutput).forEach(f => {
    fs_.writeFileSync(X.journaldir + f + '.0', X.journalOutput[f]);
  });
}


var seen = {};
function processPOM(pom) {
  if ( seen[pom.location] ) return;
  if ( X.buildlib ) loadLibs(pom);
  seen[pom.location] = true;
  verbose('GENJAVA: Scanning POM for java files:', pom.location);
  processDir(pom, pom.location || '/', false);
}

foam.poms.forEach(processPOM);
console.log(`GENJAVA: Found ${found} java files.`);

//console.log(X.javaFiles);
fs_.writeFileSync('./target/javaFiles', X.javaFiles.join('\n') + '\n');

// REVIEW: outputJournals() should already generate all journal.0 files, writing to journalFiles is not needed
// fs_.writeFileSync('journalFiles',       X.journalFiles.join('\n') + '\n');

if ( ! fs_.existsSync(X.d) ) fs_.mkdirSync(X.d, {recursive: true});

var cmd = `time javac -parameters ${X.javacParams} -d ${X.d} -classpath "${X.d}:./target/lib/*:./foam3/android/nanos_example_client/gradle/wrapper/gradle-wrapper.jar" @target/javaFiles`;

console.log('GENJAVA Compiling:', cmd);
exec_.exec(cmd, [], (error, stdout, stderr) => {
  console.log('GENJAVA Finished Compiling');
  console.log(stdout);
  console.log(stderr);
  if ( error ) {
    console.log(error);
    process.exit(1);
  }
});

console.log(`[GENJAVA] Generating ${Object.keys(X.journalOutput).length} journal files from ${X.journalFiles.length} sources.`);
// console.log(X.journalFiles);

outputJournals();
// console.log('************ PROCESS', process.env);
