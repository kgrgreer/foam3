#!/usr/bin/env node

globalThis.FOAM_FLAGS = {
  web: true,
  c: true,
  debug: true,
};

require(__dirname + '/../../src/foam.c');
require(__dirname + '/../../src/foam/nanos/nanos.c');

var deps = [
  'foam.build.Builder',
]

Promise.all(deps.map(d => foam.__context__.classloader.load(d))).then(function() {
  foam.build.Builder.create({
    targetFile: __dirname + '/foam-bin.c',
        enabledFeatures: ['web', 'c'],
  }).execute()
});
