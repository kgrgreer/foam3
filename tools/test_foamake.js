const util = require('util');
var fs = require('fs');
// Next 28 lines copied from liquid_journal_script.js
var npRoot = __dirname + '/../';

global.FOAM_FLAGS = {
  js: true,
  web: true,
  node: true,
  java: true,
  swift: true,
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
// require(npRoot + 'nanopay/src/net/nanopay/iso20022/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso8583/files.js');
require(npRoot + 'nanopay/src/net/nanopay/flinks/utils/files.js');
global.FOAM_FLAGS.src = old;
global.FOAM_ROOT = oldRoot;

function main () {
    var se = foam.tools.foamake.ShellExecutor.create();
    r = se.run(`
        echo "Hello, world!"
    `, 'bash');
    if ( r instanceof Error ) {
        console.error(r);
    }
}

main();
