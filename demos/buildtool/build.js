#!/usr/bin/env node

globalThis.FOAM_FLAGS = {
  web: true,
  c: true,
  debug: true,
};

require(__dirname + '/../../src/foam.c');

foam.__context__.classloader.addClassPath(__dirname + '/src');

Promise.all([
  foam.__context__.classloader.load('foam.build.Builder'),
  foam.__context__.classloader.load('demo.build.ModelToBuild'),
]).then(function(cls) {
  foam.build.Builder.create({
    targetFile: __dirname + '/foam-bin.c',
    enabledFeatures: ['web', 'c'],
  }).execute()
});
