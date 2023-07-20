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

console.log('[PMAKE] Starting...');

const startTime = Date.now();

const fs_   = require('fs');
const path_ = require('path');
const b_    = require('./buildlib');

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
    makers:        './GenJavaMaker,./MavenMaker,./JavacMaker,./JournalMaker' // TODO: genjava, doc, js, swift
  },
  {
    verbose:       false  // print extra status information
  }
);

globalThis.X       = X;
globalThis.flags   = flags;
globalThis.verbose = function verbose() { if ( flags.verbose ) console.log.apply(console, arguments); }

const VISITORS = X.makers.split(',').map(require);

VISITORS.forEach(v => v.init && v.init()); // ???: Is this needed?

X.outdir     = path_.resolve(path_.normalize(X.outdir || (X.builddir + '/src/java'))); // TODO: move to GenJavaMaker

X.pom.split(',').forEach(pom => foam.require(pom, false, true));

X.journaldir = X.builddir + '/journals/'; // TODO: move to JournalMaker
X.libdir     = X.builddir + '/lib';       // TODO: move to MavenMaker

// If genjava is disabled, then override foam.loadFiles so that the POM
// structure is loaded but .js files aren't.
// if ( ! flags.genjava ) {
//  foam.loadFiles = function() {};
// }

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
        if ( ! b_.isExcluded(pom, fn) ) processDir(pom, fn, true);
      }
    } else {
      VISITORS.forEach(v => v.visitFile && v.visitFile(pom, f, fn));
    }
  });
}

var seen = {};

foam.poms.forEach(pom => {
  if ( seen[pom.location] ) return;
  VISITORS.forEach(v => v.visitPOM && v.visitPOM(pom));
  seen[pom.location] = true;
  processDir(pom, pom.location || '/', false);
});

VISITORS.forEach(v => v.end && v.end());

console.log(`[PMAKE] Finished in ${Math.round((Date.now()-startTime)/1000)}s.`);
