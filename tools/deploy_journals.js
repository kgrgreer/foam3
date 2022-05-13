/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// !!!
// TEMPORARY JOURNAL DEPLOYMENT SCRIPT
// this will be replaced with the following once it's working:
// https://github.com/kgrgreer/foam3/pull/1661
// !!!

const startTime = Date.now();
const path_     = require('path');
const fs_       = require('fs');
const path = require('path/posix');

require('../src/foam_node.js');

var [argv, X, flags] = require('./processArgs.js')(
  '',
  { srcdirs: '', outdir: 'runtime/journals', version: '', license: '', pom: 'pom' },
  { debug: true, java: false, web: true }
);

foam.require(X.pom, false, true);


const outPath = X.outdir;

if ( ! fs_.existsSync(outPath) ) {
    fs_.mkdirSync(outPath, { recursive: true });
}

async function findJournals({ jrls, srcPath }) {
    const walker = foam.util.filesystem.FileWalker.create();
    walker.files.sub((_1, _2, info) => {
        for ( const fileInfo of info.files ) {
            const extName = path_.extname(fileInfo.name);
            if ( extName !== '.jrl' ) continue;
            const fullPath = fileInfo.fullPath;
            const baseName = path_.basename(fileInfo.name, extName);
            if ( ! jrls[baseName] ) jrls[baseName] = '';
            jrls[baseName] += fs_.readFileSync(fullPath).toString();
        }
    })
    await walker.walk(srcPath);
}

const main = async function () {
    const jrls = {};

    for ( const srcdir of X.srcdirs.split(',').filter(v => v) ) {
        await findJournals({ jrls, srcPath: srcdir });
    }

    for ( const key in jrls ) {
        fs_.writeFileSync(path_.join(outPath, key + '.0'), jrls[key]);
        fs_.writeFileSync(path_.join(outPath, key), '');
    }
};

main();
