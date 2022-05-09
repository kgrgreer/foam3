/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const path_     = require('path');
const fs_       = require('fs');
const path = path_.posix;

require('../src/foam_node.js');

var [argv, X, flags] = require('./processArgs.js')(
  '',
  { version: '', license: '', pom: 'pom' },
  { debug: true, java: false, web: true }
);

foam.require(X.pom, false, true);

const outPath = 'runtime/journals';

if ( ! fs_.existsSync(outPath) ) {
    fs_.mkdirSync(outPath, { recursive: true });
}

async function findJournals({ jrls, srcPath, jrlName }) {
    const walker = foam.util.filesystem.FileWalker.create();
    walker.files.sub((_1, _2, info) => {
        for ( const fileInfo of info.files ) {
            if ( foam.poms[fileInfo.path] != undefined ) continue;
            const extName = path_.extname(fileInfo.name);
            if ( extName !== '' && extName !== '.jrl' ) continue;
            if ( jrlName && fileInfo.name != jrlName ) continue;
            const fullPath = fileInfo.fullPath;
            const baseName = path_.basename(fileInfo.name, extName);
            if ( ! jrls[baseName] ) jrls[baseName] = '';
            jrls[baseName] += fs_.readFileSync(fullPath).toString();
            if ( jrlName && fileInfo.name == jrlName ) return;
        }
    })
    await walker.walk(srcPath);
}


 const main = async function() {

 foam.require(X.pom, false, true);
 const jrls = [];
 asyncForEach(Object.keys(foam.poms), async(p) => {
   if ( foam.poms[p].journals ) {
     foam.poms[p].journals.forEach(async (j) => {
      await findJournals({jrls, srcPath: p, jrlName: j});
     })
   } else {
   if ( foam.poms[p].projects ) return;
     await findJournals({jrls, srcPath: p});
   }
  }).then(function() {
    for ( const key in jrls ) {
        fs_.writeFileSync(path_.join(outPath, key + '.0'), jrls[key]);
    }
  });
 }

 async function asyncForEach(array, callback) {
   for (let index = 0; index < array.length; index++) {
     await callback(array[index], index, array);
   }
 }
main();
