#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

globalThis.FOAM_FLAGS = {
  'android': true
};

require(root + '/src/foam.c');
require(root + '/src/foam/classloader/OrDAO.c');
require(root + '/src/foam/classloader/NodeModelFileDAO.c');
require(root + '/src/foam/classloader/NodecModelExecutor.c');
require(root + '/src/foam/android/tools/GenStrings.c');

var execSync = require('child_process').execSync
execSync('rm -rf ' + dir + '/gen');
execSync('mkdir -p ' + dir + '/gen');

var executor = foam.classloader.NodecModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/c'
  ],
  modelId: 'foam.android.tools.GenStrings',
  modelArgs: {
    models: [
      'nodetooldemo.Test',
    ],
    outfile: dir + '/gen/strings.xml',
  },
});

foam.locale = 'en';
executor.execute().then(function() {
  foam.locale = 'fr';
  executor.modelArgs.outfile = dir + '/gen/strings-fr.xml';
  executor.execute();
})
