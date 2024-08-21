#!/usr/bin/env node
const fs_   = require('fs');
const path_ = require('path');

const LICENSE = `/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
`;

file = fs_.readFileSync('mlang.js','utf8');

models = file.split(/^foam./m);

console.log('Models:', models.length);

models.forEach(m => {
//  console.log(m.substring(0,50));
  try {
    var package = /package: '([^']*)'/g.exec(m)[1];
    var name    = /name: '([^']*)'/g.exec(m)[1];
    var filename = package.replace('foam.mlang.', '').replace('foam.mlang','').replaceAll('.', '/') + '/' + name;
    if ( filename.startsWith('/') ) filename = filename.substring(1);
    var pfilename = '"' + filename + '",';
    pfilename = (pfilename + '                                                      ').substring(0,40);
//  console.log('Model: ', package, name);
console.log(`    { name: ${pfilename}flags: "js|java" },`);

    var file = LICENSE + "\nfoam." + m.trim() + "\n";
    fs_.writeFileSync('./' + filename + '.js', file);

} catch(x) {
  console.log(x);
 //  console.log('error', m.substring(0,100));
 }
});
// console.log(file);
