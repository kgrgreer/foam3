/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: no longer works, updated based on genjava

var execSync = require('child_process').execSync
var path_ = require('path');

// Enable FOAM swift support.
globalThis.FOAM_FLAGS = {
  'c': false,
  'java': false,
  'node': false,
  'swift': true,
  'debug': true,
};

var dir = __dirname;
var root = dir + '/..';

require(root + '/src/foam.c');
require('../src/foam/nanos/nanos.c'); // TODO this shouldnt always be loaded.
require('../src/foam/support/support.c'); // TODO this shouldnt always be loaded.

if ( ! (process.argv.length >= 4 && process.argv.length <= 5) ) {
  console.log("USAGE: genswift.c input-path output-path classpaths(optional)");
  process.exit(1);
}

var srcPaths = [root + '/src'];
if ( process.argv.length == 5 ) {
  srcPaths = process.argv[4].split(',').map(function(srcPath) {
    return srcPath.endsWith('/') ? srcPath.slice(0, -1) : srcPath
  });
}

var indir = process.argv[2];
indir = path_.resolve(path_.normalize(indir));

var externalFile = require(indir);
var classes = externalFile.classes;

var outdir = process.argv[3];
outdir = path_.resolve(path_.normalize(outdir));
execSync('rm -rf ' + outdir);

var executor = foam.classloader.NodecModelExecutor.create({
  classpaths: srcPaths,
  modelId: 'foam.swift.GenSwift',
  modelArgs: {
    models: classes,
    outdir: outdir,
  },
});
executor.execute();
