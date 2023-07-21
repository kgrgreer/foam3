/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

exports.description = 'copies .jrl files into /target/journals';

const fs_   = require('fs');
const path_ = require('path');
const b_    = require('./buildlib');

const journalFiles  = [];
const journalOutput = {};

exports.init = function() {
  X.journaldir = X.builddir + '/journals/';
}


exports.visitFile = function(pom, f, fn) {
  if ( f.name.endsWith('.jrl') ) {
    verbose('\t\tjournal source:', fn);
    journalFiles.push(fn);

    var i           = fn.lastIndexOf('/');
    var journalName = fn.substring(i+1, fn.length-4);
    var file        = fs_.readFileSync(fn).toString();

    if ( ! file.length ) return;

    file = `// The following ${(file || '').split('\n').length} lines were copied from "${path_.relative(process.cwd(), fn)}"\n` + file + '\n';
    journalOutput[journalName] = (journalOutput[journalName] || '') + file;
  }
}


exports.end = function() {
  console.log(`[Journal Maker] Creating journals to ${X.journaldir}`);

  b_.ensureDir(X.journaldir);

  if ( fs_.existsSync(X.journaldir) ) {
    fs_.readdirSync(X.journaldir).forEach(f => fs_.rmSync(`${X.journaldir}/${f}`));
  } else {
    fs_.mkdirSync(X.journaldir, {recursive: true});
  }

  Object.keys(journalOutput).forEach(f => {
    fs_.writeFileSync(X.journaldir + f + '.0', journalOutput[f]);
  });

  // Write to journal_files is not needed, just for backward compatibility with find.sh
  fs_.writeFileSync(X.builddir + '/journal_files', journalFiles.join('\n') + '\n');

  console.log(`[Journal Maker] Generating ${Object.keys(journalOutput).length} journal files from ${journalFiles.length} sources.`);
}
