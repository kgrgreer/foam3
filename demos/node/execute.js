#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.c');
require(root + '/src/foam/classloader/OrDAO.c');
require(root + '/src/foam/classloader/NodeModelFileDAO.c');
require(root + '/src/foam/classloader/NodecModelExecutor.c');

foam.locale = 'fr';

var executor = foam.classloader.NodecModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/c'
  ],
  modelId: 'nodetooldemo.Test',
  modelArgs: {
    name: 'Joe',
  },
});
executor.execute()
