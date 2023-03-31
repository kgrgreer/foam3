/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const path_     = require('path');
const fs_       = require('fs');
const path = path_.posix;

require('../src/foam_node.c');

var [argv, X, flags] = require('./processArgs.c') (
  '',
  { version: '', license: '', pom: 'pom' },
  { debug: true, java: false, web: true }
);

foam.require(X.pom, false, true);

const outPath = 'runtime/journals';

if ( ! fs_.existsSync(outPath) ) {
  fs_.mkdirSync(outPath, { recursive: true });
}

async function findJournals({ jrls, srcPath }) {
  console.log('finding in ' + srcPath)
  const walker = foam.util.filesystem.FileWalker.create();
  walker.files.sub((_1, _2, info) => {
    for ( const fileInfo of info.files ) {
      if ( fileInfo.path !== srcPath &&
        foam.poms[foam.poms.findIndex(p => p.location == fileInfo.path)] != undefined
      ) {
        walker.skip.pub();
        return;
      }
      const extName = path_.extname(fileInfo.name);
      if ( extName !== '.jrl' ) continue;
      const fullPath = fileInfo.fullPath;
      const baseName = path_.basename(fileInfo.name, extName);
      if ( ! jrls[baseName] ) jrls[baseName] = '';
      jrls[baseName] += '\n' + fs_.readFileSync(fullPath).toString();
    }
  })
  await walker.walk(srcPath);
}


const main = async function() {

  foam.require(X.pom, false, true);
  const jrls = {};
  await asyncForEach(foam.poms, async(p) => {
    if ( p.pom.journals ) {
      p.pom.journals.forEach(async (j) => {
        if ( ! jrls[path_.basename(j)] ) jrls[path_.basename(j)] = '';
        jrls[path_.basename(j)] += fs_.readFileSync(path_.join(p.location, j+'.jrl')).toString();
      })
    } else {
      // if ( p.pom.projects ) return;
      await findJournals({jrls, srcPath: p.location});
    }
  });
  for ( const key in jrls ) {
    // console.log('writing...', path_.join(outPath, key  + '.0'))
    fs_.writeFileSync(path_.join(outPath, key + '.0'), jrls[key]);
  }
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

main();
