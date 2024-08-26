#!/usr/bin/env node
const fs_   = require('fs');
const path_ = require('path');

var LICENSE = undefined;

const PACKAGE = 'foam.dao';
const INPUT   = 'DAOInterceptor.js';

var git  = `git rm ${INPUT}\n`;
var git2 = `git commit ${INPUT}`;

file = fs_.readFileSync(INPUT,'utf8');

models = file.split(/^foam./m);

models.forEach(m => {
  if ( ! LICENSE ) {
    LICENSE = m.trim() + "\n";
    return;
  }
  try {
    var package = /package: '([^']*)'/g.exec(m)[1];
    var name    = /name: '([^']*)'/g.exec(m)[1];
    var filename = package.replace(PACKAGE + '.', '').replace(PACKAGE,'').replaceAll('.', '/') + '/' + name;
    if ( filename.startsWith('/') ) filename = filename.substring(1);
    var pfilename = '"foam/dao/' + filename + '",';
    pfilename = (pfilename + '                                                      ').substring(0,56);
    console.log(`    { name: ${pfilename}flags: "js|java" },`);
    git += `git add ${filename}.js\n`;
    git2 += ` ${filename}.js `;

    var file = LICENSE + "\nfoam." + m.trim() + "\n";
    fs_.writeFileSync('./' + filename + '.js', file);
  } catch(x) {
  }
});

console.log('\n' + git);
console.log(git2 + ` -m "Split ${INPUT} into separate model files."\n'`);
