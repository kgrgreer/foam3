/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// POM Make - POM Specific Build Tool
//
// Recursively traverses POMs applying specified makers.
//
// Uses the Visitor design pattern, with Makers actually being visitors.
//
// Standard Makers Include:
//
//  - JavacMaker
//  - MavenMaker
//  - JournalMaker
//  - VerboseMaker
//
//     - generates .java files from .js models
//     - copies .jrl files into /target/journals
//     - TODO: copy .flow files into /target/documents
//     - create /target/javacfiles file containing list of modified or static .java files
//     - build pom.xml from accumulated javaDependencies
//     - call maven to update dependencies if pom.xml updated
//     - call javac to compile files in javacfiles
//     - create a Maven pom.xml file with accumulated POM javaDependencies information

console.log('[PMAKE] Starting');

const startTime = Date.now();

const fs_   = require('fs');
const exec_ = require('child_process');
const path_ = require('path');

require('../src/foam_node.js');

var [argv, X, flags] = require('./processArgs.js')(
  '',
  {
    d:             './build/classes/java/main', // TODO: build/classes should be sufficient, but doesn't work with rest of build
    builddir:      './target',
    javacParams:   '--release 11',
    repo:          'http://repo.maven.apache.org/maven2/', // should be https?
    outdir:        '', // default value set below
    pom:           'pom',
    makers:        './MavenMaker,./JavacMaker,./JournalMaker' // TODO: genjava, doc, js, swift
  },
  {
    // buildlib:      false, // generate Maven pom.xml
    // buildjournals: false, // generate journal.0 files
    genjava:       true,  // generate .java source from model files
    // javac:         false, // compile generated and static .java files
    verbose:       false  // print extra status information
  }
);

globalThis.X     = X;
globalThis.flags = flags;

const VISITORS = X.makers.split(',').map(require);

VISITORS.forEach(v => v.init && v.init());

X.outdir           = path_.resolve(path_.normalize(X.outdir || (X.builddir + '/src/java')));

X.pom.split(',').forEach(pom => foam.require(pom, false, true));

X.journaldir = X.builddir + '/journals/';
X.libdir     = X.builddir + '/lib';

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

console.log(`END PMAKE: ${jCount}/${mCount} models processed in ${Math.round((Date.now()-startTime)/1000)}s.`);

// console.log(X.javaFiles);
// console.log(foam.poms);


var found = 0;


globalThis.writeFileIfUpdated = function writeFileIfUpdated(file, txt) {
  if ( fs_.existsSync(file) && ( fs_.readFileSync(file).toString() === txt ) )
    return false;

  fs_.writeFileSync(file, txt);
  return true;
}


globalThis.execSync = function execSync(cmd, options) {
  console.log('\x1b[0;32mExec: ' + cmd + '\x1b[0;0m');
  return exec_.execSync(cmd, options);
}


globalThis.verbose = function verbose() {
  if ( flags.verbose ) console.log.apply(console, arguments);
}


globalThis.isExcluded = function isExcluded(pom, f) {
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
    if ( f.isDirectory() ) {
      if ( ! f.name.startsWith('.') ) {
        if ( f.name.indexOf('android') != -1 ) return;
        if ( f.name.indexOf('examples') != -1 ) return;
        if ( ! isExcluded(pom, fn) ) processDir(pom, fn, true);
      }
    } else {
      VISITORS.forEach(v => v.visitFile && v.visitFile(pom, f, fn));
    }
  });
}


// TODO: move to common library
globalThis.ensureDir = function ensureDir(dir) {
  if ( ! fs_.existsSync(dir) ) {
    console.log('Creating directory', dir);
    fs_.mkdirSync(dir, {recursive: true});
  }
}


function processPOMs() {
  var seen = {};
  function processPOM(pom) {
    if ( seen[pom.location] ) return;
    try { VISITORS.forEach(v => v.visitPOM && v.visitPOM(pom)); } catch (x) { console.log('******', x); }
    seen[pom.location] = true;
    verbose('[PMAKE] Scanning POM for java files:', pom.location);
    processDir(pom, pom.location || '/', false);
  }

  foam.poms.forEach(processPOM);
  console.log(`[PMAKE] Found ${found} java files.`);
}



if ( VISITORS.length ) {
  processPOMs();
  VISITORS.forEach(v => v.end && v.end());
}
