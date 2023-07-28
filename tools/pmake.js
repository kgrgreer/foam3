#!/usr/bin/env node
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
//   JavaMaker    : generates .java files from .js models
//   JavacMaker   : create /target/javacfiles file containing list of modified or static .java files, call javac
//   MavenMaker   : build a Maven pom.xml from javaDependencies, call maven if pom.xml updated
//   JournalMaker : copies .jrl files into /target/journals
//   JsMaker      : create a minified foam-bin.js file
//   DocMaker     : copies .flow files into /target/documents
//   VerboseMaker : print out information about POMs and files visited

console.log('[PMAKE] Starting...');

const startTime = Date.now();

const fs_   = require('fs');
const path_ = require('path');
const b_    = require('./buildlib');

require('../src/foam_node.js');

// TODO: new version of processArgs which takes a map
var [argv, X, flags] = require('./processArgs.js')(
  '',
  {
    d:           './build/classes/java/main', // TODO: build/classes should be sufficient, but doesn't work with rest of build
    builddir:    './target',
    pom:         'pom',
    makers:      '' // TODO: doc, swift
  },
  {
    // TODO: it would be better if the Makers specified if they needed files loaded or not
    loadFiles:   false,  // controls if individual .js files are loaded or not
    verbose:     false   // print extra status information
  },
  {
    usage: function() {
      // Include list of available Makers in 'usage' output.
      var files = fs_.readdirSync('.');

      console.log('\nMakers:');
      files.forEach(f => {
        if ( f.endsWith('Maker.js') ) {
          var maker = require('./' + f.substring(0, f.length-3));
          console.log('  ' + f.substring(0, f.length-8).padEnd(14, ' '), maker.description || '');
          ( maker.args || []).forEach(a => {
            var desc = a.description || '';
            var def = a.value ? ( ( desc ? ', ' : '' ) + 'default: ' + a.value ) : '';
            console.log('     ' + a.name.padEnd(12, ' ') + desc + def);
          });
        }
      });
    }
  }
);

globalThis.X       = X;
globalThis.flags   = flags;
globalThis.verbose = function verbose() { if ( flags.verbose ) console.log.apply(console, arguments); }

const MAKERS = X.makers.split(',').map(m => {
  try {
    return require('./' + m + 'Maker');
  } catch (x) {
    return require(path_.join(__dirname, m + 'Maker'));
  }
});


MAKERS.forEach(v => v.init && v.init());


function processDir(pom, location, skipIfHasPOM) {
  verbose('\tdirectory:', location);
  var files = fs_.readdirSync(location, {withFileTypes: true});

  if ( skipIfHasPOM && files.find(f => f.name.endsWith('pom.js')) ) return;

  files.forEach(f => {
    var fn = location + '/' + f.name;
    if ( f.isDirectory() ) {
      if ( ! f.name.startsWith('.') ) {
        if ( f.name === 'build' || f.name === 'build2' ) return;
        if ( f.name.indexOf('android') != -1 ) return;
        if ( f.name.indexOf('examples') != -1 ) return;
        if ( ! b_.isExcluded(pom, fn) ) processDir(pom, fn, true);
      }
    } else {
      MAKERS.forEach(v => v.visitFile && v.visitFile(pom, f, fn));
    }
  });
}


var SUPER = foam.POM;
var seen  = {};

foam.POM = function(pom) {
  if ( seen[foam.cwd] ) return;
  seen[foam.cwd] = true;

  pom.location = foam.cwd;
  pom.path     = foam.sourceFile;
  MAKERS.forEach(v => v.visitPOM && v.visitPOM(pom));
  SUPER(pom);
  processDir(pom, foam.cwd, false);
  MAKERS.forEach(v => v.endVisitPOM && v.endVisitPOM(pom));
}

// Speeds up Makers like Verbose and JS which don't need to load .js model files.
if ( ! flags.loadFiles ) foam.loadFiles = function() {};

X.pom.split(',').forEach(pom => {
  try {
    foam.require(pom, false, true);
  } catch (x) {
    console.log('ERROR:', x);
    console.error('Unable to load POM: ' + pom);
    process.exit(-1);
  }
});


MAKERS.forEach(v => v.end && v.end());

console.log(`[PMAKE] Finished in ${Math.round((Date.now()-startTime)/1000)}s.`);
