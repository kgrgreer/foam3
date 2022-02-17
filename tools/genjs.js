/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: don't actually load files
// print warning if uglify not found
// create sourcemap

const path_          = require('path');
const fs_            = require('fs');
const uglify_        = require('uglify-js');
var [argv, X, flags] = require('./processArgs.js')(
  'sourcefiles*"',
  { version: '', license: '' },
  { debug: true }
);

require('../src/foam_node.js');

// Load Manifest (files.js) Files
argv.forEach(fn => {
  flags.src = fn.substring(0, fn.indexOf('/src/')+5);
  require(fn);
});

var version = X.version;
var files   = {}; // filename to content map for uglify

// Remove foam_node.js from first of list
globalThis.loadedFiles.shift();

// Build array of files for Uglify
globalThis.loadedFiles.forEach(l => {
  try {
    l = path_.resolve(__dirname, l);
    files[l] = fs_.readFileSync(l, "utf8");
  } catch (x) {}
});

try {
  var code = uglify_.minify(
    files,
    {
      compress: false,
      mangle:   false,
      output:   { preamble: X.license }
    }).code;

  // Remove most Java and Swift Code
  code = code.replaceAll(/(java|swift)(Code|Setter|Getter|Factory|PreSet|PostSet):`(\\`|[^`])*`,?/gm, '');
  code = code.replaceAll(/(java|swift)(Code|Setter|Getter|Factory|PreSet|PostSet):"(\\"|[^"])*",/gm, '');
  code = code.replaceAll(/(java|swift)(Code|Setter|Getter|Factory|PreSet|PostSet):'(\\'|[^'])*',/gm, '');
  code = code.replaceAll(/(java|swift)(Code|Setter|Getter|Factory|PreSet|PostSet):"(\\"|[^"])*"}/gm, '}');
  code = code.replaceAll(/documentation:`(\\`|[^`])*`,/gm, '');
  code = code.replaceAll(/documentation:"(\\"|[^"])*",/gm, '');
  code = code.replaceAll(/documentation:`(\\`|[^`])*}'/gm, '}');
  code = code.replaceAll(/documentation:"(\\"|[^"])*}",/gm, '}');

  // Remove leading whitespace (probably from in-lined CSS)
  code = code.replaceAll(/^\s*/gm, '');

  // Put each Model on its own line
  code = code.replaceAll(/foam.CLASS\({/gm, '\nfoam.CLASS({');

  fs_.writeFileSync(version ? `foam-bin-${version}.js` : 'foam-bin.js', code);
} catch (x) {
  console.log('ERROR (JSBUILD):', x);
}
