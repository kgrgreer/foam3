/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// JSMaker

exports.description = 'create minified foam-bin.js distribution';

const fs_      = require('fs');
const path_    = require('path');
const uglify_  = require('uglify-js');

const licenses = {};
var version    = '';
var files      = {}; // filename to content map for uglify

function addLicense(l) {
  l = l.split('\n').map(l => l.trim()).join('\n');
  licenses[l] = true;
}

exports.init = function() {
  flags.java      = false;
  flags.web       = true;
  flags.loadFiles = true;
}


exports.visitPOM = function(pom) {
  if ( ! version && pom.version ) version = pom.version;

  if ( typeof pom.licenses === 'string' ) {
    addLicense(pom.licenses);
  } else if ( Array.isArray(pom.licenses) ) {
    pom.licenses.forEach(addLicense);
  }
}


exports.end = function() {
  var loaded = Object.keys(globalThis.foam.loaded);
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

  var a = Object.keys(licenses);
  var license = '';
  if ( a.length == 1 ) {
    license = '\nCopyright:\n';
  } else if ( a.length ) {
    license = '\nPortions Copyright:\n';
  }
  license += a.join('');

  license = license.split('\n').map(l => '// ' + l).join('\n');

  console.log(`[JS Maker] Version: ${version}, Licenses: ${Object.keys(licenses).length}, Files: ${Object.keys(files).length}`);
  var code = uglify_.minify(
    files,
    {
      compress: false,
      mangle:   false,
      output:   { preamble: `// Generated: ${new Date()}\n\n${license}\nvar foam = { main: function() { /* prevent POM loading since code is in-lined below */ } };\n` }
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

  var filename = version ? `foam-bin-${version}.js` : 'foam-bin.js';
  console.log('[JS Maker] Writing', filename);
  fs_.writeFileSync(filename, code);
}
