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
    // POM's can be included in files: so just ignore
    // This is needed when separate pom's need to be loaded in a specific
    // order rather than just before all files:. This happens in the main FOAM pom.
    if ( l.endsWith('pom.js') ) return;
    try {
      l = path_.resolve(__dirname, l);
      if ( X.stage === undefined ) {
        files[l] = fs_.readFileSync(l, "utf8");
      } else {
        var stage = foam.stages[l] ?? foam.defaultStage;
        if ( X.stage == stage ) {
//          console.log('***** IN stage:', X.stage,' *** file:', l);
          files[l] = fs_.readFileSync(l, "utf8");
        } else {
//          console.log('***** EX stage:', X.stage, stage, ' *** file:', l);
        }
      }
    } catch (x) {
      // console.log('********************************* Unexpected Error: ', x);
    }
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

  console.log(`[JS] Version: ${version}, Licenses: ${Object.keys(licenses).length}, Files: ${Object.keys(files).length}, Stage: ${X.stage}`);
  var code = uglify_.minify(
    files,
    {
      compress: false,
      mangle:   false,
      output:   {
        semicolons: false,
        preamble: `// Generated: ${new Date()}\n\n${license}\n` + ((! X.stage) ? `var foam = { main: function() { /* prevent POM loading since code is in-lined below */ } };\n` : '')
      }
    }).code;

  if ( ! code ) {
    console.log('No output for stage:', X.stage);
    return;
  }

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

  function fn(s) {
    var stage = s == '0' ? '' : '-' + s;
    return version ? `foam-bin-${version}${stage}` : `foam-bin{$stage}`;
  }

  // TODO: check for next stage(s)
  if ( X.stage === '0' ) {
    code += `
if ( ! foam.flags.skipStage1 ) {
  if ( window.location.hash ) {
    foam.loadJSLibs([{name:'/${fn('1')}.js'}]);
  } else {
    window.setTimeout(() =>
      window.requestIdleCallback(() => foam.loadJSLibs([{name:'/${fn('1')}.js'}]),{timeout:15000}),
      2000);
  }
}
`;
  }
  // Put each Model on its own line
  // not needed with the semicolons: false options set above
//  code = code.replaceAll(/foam.CLASS\({/gm, '\nfoam.CLASS({');

  var filename = fn(X.stage);
  console.log('[JS] Writing', filename + '.js');
  fs_.writeFileSync(filename + '.js', code);
}
