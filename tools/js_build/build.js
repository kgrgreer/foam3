#!/usr/bin/env node

var npRoot = __dirname + '/../../';
let version = process.argv[2];

if ( version == null ) target = '/foam-bin.js'
else target = `/foam-bin-${version}.js`

global.FOAM_FLAGS = {
  js: true,
  web: true,
  node: true,
  java: true,
  swift: true,
  debug: true,
};

require(npRoot + 'foam3/src/foam.js');
require(npRoot + 'foam3/src/foam/nanos/nanos.js');
require(npRoot + 'foam3/src/foam/support/support.js');

var classloader = foam.__context__.classloader;
[
  npRoot + 'nanopay/src',
].forEach(classloader.addClassPath.bind(classloader));

var old = global.FOAM_FLAGS.src;
var oldRoot = global.FOAM_ROOT;
global.FOAM_FLAGS.src = npRoot + 'nanopay/src/'; // Hacky
require(npRoot + 'nanopay/src/net/nanopay/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso20022/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso8583/files.js');
require(npRoot + 'nanopay/src/net/nanopay/flinks/utils/files.js');
require(npRoot + 'nanopay/src/net/nanopay/merchant/merchant.js');
global.FOAM_FLAGS.src = old;
global.FOAM_ROOT = oldRoot;

// TODO: Assets?
// TODO: Generate the various html files so we don't need to keep them all in
// sync.
Promise.all([
  'foam.build.Builder'
].map(classloader.load.bind(classloader))).then(function() {
  foam.build.Builder.create({
    enabledFeatures: ['js', 'web'],
    targetFile: __dirname + target,
    blacklist: [], // todo
  }).execute();
});
