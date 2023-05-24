/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: don't actually load files
// print warning if uglify not found
// create sourcemap
// merge with processArgs.js

console.log('START GENJS');

const startTime = Date.now();
const path_     = require('path');
const fs_       = require('fs');
const uglify_   = require('uglify-js');

require('../src/foam_node.js');

var [argv, X, flags] = require('./processArgs.js')(
  '',
  { version: '', license: '', pom: 'pom' },
  { debug: true, java: false, web: true, genjava: false }
);

foam.require(X.pom, false, true);

var version  = X.version;
var files    = {}; // filename to content map for uglify
var loaded   = Object.keys(globalThis.foam.loaded);

loaded.unshift(path_.dirname(__dirname) + '/src/foam.js');

// Build array of files for Uglify
loaded.forEach(l => {
  try {
    l = path_.resolve(__dirname, l);
    if ( foam.excluded[l] ) { /* console.log('****** EXCLUDING', l); */ return; }
    // console.log('****** INCLUDING', l);
    files[l] = fs_.readFileSync(l, "utf8");
  } catch (x) {}
});

try {
  var code = uglify_.minify(
    files,
    {
      compress: false,
      mangle:   false,
      output:   { preamble: `// Generated: ${new Date()}\n//\n${X.license}\nvar foam = { main: function() { /* prevent POM loading since code is in-lined below */ } };\n` }
    }).code;

  // Remove most Java and Swift Code
  code = code.replace(/(java|swift)(DefaultValue|Type|Code|Setter|Getter|Factory|PreSet|PostSet|Extends):`(\\`|[^`])*`}/gm, '}');
  code = code.replace(/(java|swift)(DefaultValue|Type|Code|Setter|Getter|Factory|PreSet|PostSet|Extends):"(\\"|[^"])*"}/gm, '}');
  code = code.replace(/(java|swift)(DefaultValue|Type|Code|Setter|Getter|Factory|PreSet|PostSet|Extends):'(\\'|[^'])*'}/gm, '}');
  code = code.replace(/(java|swift)(DefaultValue|Type|Code|Setter|Getter|Factory|PreSet|PostSet|Extends):`(\\`|[^`])*`,/gm, '');
  code = code.replace(/(java|swift)(DefaultValue|Type|Code|Setter|Getter|Factory|PreSet|PostSet|Extends):"(\\"|[^"])*",/gm, '');
  code = code.replace(/(java|swift)(DefaultValue|Type|Code|Setter|Getter|Factory|PreSet|PostSet|Extends):'(\\'|[^'])*',/gm, '');
  code = code.replace(/swiftThrows:true,/gm, '');
  code = code.replace(/swiftSynchronized:true,/gm, '');
  code = code.replace(/swiftThrows:true}/gm, '}');
  code = code.replace(/swiftSynchronized:true}/gm, '}');
  code = code.replace(/javaGenerate(Convenience|Default)Constructor:false,?/gm, '');
  code = code.replace(/java(Imports|Throws|Implements):\[[^\]]*\], ?/gm, '');
  /*
  code = code.replace(/documentation:`(\\`|[^`])*`,?/gm, '');
  code = code.replace(/documentation:'(\\`|[^'])*',?/gm, '');
  code = code.replace(/documentation:"(\\`|[^"])*",?/gm, '');
  */
  code = code.replace(/documentation:`(\\"|[^`])*`}/gm, '}');
  code = code.replace(/documentation:'(\\"|[^'])*'}/gm, '}');
  code = code.replace(/documentation:"(\\"|[^"])*"}/gm, '}');
  code = code.replace(/documentation:`(\\"|[^`])*`,/gm, '');
  code = code.replace(/documentation:'(\\"|[^'])*',/gm, '');
  code = code.replace(/documentation:"(\\"|[^"])*",/gm, '');

  // Remove leading whitespace (probably from in-lined CSS)
  code = code.replaceAll(/^\s*/gm, '');

  // Put each Model on its own line
  code = code.replaceAll(/foam.CLASS\({/gm, '\nfoam.CLASS({');

  fs_.writeFileSync(version ? `foam-bin-${version}.js` : 'foam-bin.js', code);
} catch (x) {
  console.log('ERROR (JSBUILD):', x);
}
console.log(`END GENJS: ${Object.keys(files).length} files processed in ${Math.round((Date.now()-startTime)/1000)}s.`);
