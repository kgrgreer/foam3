#!/usr/bin/env node

require('./../foam2/src/foam.js');

var outDir = __dirname + '/../STRIPPED_BUILD/src'
var srcDirs = [
  global.FOAM_ROOT,
  __dirname + '/../nanopay/src',
  __dirname + '/../interac/src',
];

// Clear the destination dir and copy all resources to dest dir.
var cp = require('child_process');
cp.execSync('rm -rf ' + outDir)
cp.execSync('mkdir -p ' + outDir)
srcDirs.forEach(function(srcDir) {
  cp.execSync(`rsync -a --exclude='*.js' --exclude='*.java' ${srcDir}/ ${outDir}/`)
})

srcDirs.forEach(function(srcDir) {
  foam.__context__.classloader.addClassPath(srcDir);
})

foam.__context__.classloader.load('foam.build.Builder').then(function(cls) {
  cls.create({
    srcDirs: srcDirs,
    outDir: outDir,
    flags: ['js', 'web', 'debug'],
    required: foam.build.FilesJsGen.NANOS_MODELS.concat(
      'net.nanopay.ui.Controller',
    )
  }).execute();
});
