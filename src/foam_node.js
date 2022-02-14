/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

(function() {
  var foam = globalThis.foam || ( globalThis.foam = { isServer: true, flags: globalThis.FOAM_FLAGS || {} } );

  // Imports used by the loadServer() loader
  globalThis.imports = {};
  globalThis.imports.path = require('path');
  globalThis.loadedFiles = [];

  // Is replaced when lib.js is loaded.
  foam.checkFlags = () => true;

  if ( ! globalThis.FOAM_FLAGS ) globalThis.FOAM_FLAGS = foam.flags;
  var flags = globalThis.foam.flags;

  // TODO: remove the genjava flag and let genjava set it
  if ( ! flags.hasOwnProperty('genjava')  ) flags.genjava = true;
  if ( ! flags.hasOwnProperty('node')     ) flags.node   = true;
  if ( ! flags.hasOwnProperty('java')     ) flags.java   = true;
  if ( ! flags.hasOwnProperty('swift')    ) flags.swift  = false;
  if ( ! flags.hasOwnProperty('debug')    ) flags.debug  = true;
  if ( ! flags.hasOwnProperty('js')       ) flags.js     = true;

  // TODO: the following two shouldn't be needed and should be removed when possible
  if ( ! flags.hasOwnProperty('sql')      ) flags.sql    = true;
  // Needed because flinks code uses but needs to be compiled to java
  if ( ! flags.hasOwnProperty('web')      ) flags.web    = true;

  function loadServer() {
    var caller = flags.src || __filename;
    var path   = caller.substring(0, caller.lastIndexOf('src/')+4);

    if ( ! globalThis.FOAM_ROOT ) globalThis.FOAM_ROOT = path;

    return function (filename) {
      if ( ! filename ) return;
      // Set document.currentScript.src, as expected by EndBoot.js
      let normalPath = globalThis.imports.path.relative(
        '.',
        globalThis.imports.path.normalize(path + filename + '.js'));
      globalThis.document = { currentScript: { src: normalPath } };
      var fn = path + filename + '.js';
      require(fn);
    }
  }

  this.FOAM_FILES = function(files) {
    var load = loadServer();
    var seen = {};
    var SAFE = foam.SAFE || {};
    files.
     filter(f => {
        if ( ! f.flags || ( ! f.flags.includes('swift') && ! f.flags.includes('node') ) ) {
          var caller = flags.src || __filename;
          var path   = caller.substring(0, caller.lastIndexOf('src/')+4);
          globalThis.loadedFiles.push(path + f.name + '.js');
        }
        if ( foam.checkFlags(f.flags) ) {
          return true;
        }
        return true;
      }).
      filter(f => { if ( seen[f.name] ) { console.log('duplicate', f.name); return false; } seen[f.name] = true; return true; }).
      filter(f => (! f.predicate) || f.predicate()).
      forEach(function(f) {
        foam = globalThis.foam;
        foam.currentFlags = f.flags || [];

        var count1 = Object.keys(foam.USED || {}).length + Object.keys(foam.UNUSED || {}).length;
        load(f.name);
        var count2 = Object.keys(foam.USED || {}).length + Object.keys(foam.UNUSED || {}).length;
        if ( count2 == count1 + 1 ) {
          SAFE[f.name] = true;
        }
      });
      foam.SAFE = SAFE;
  };

  loadServer()('files');
})();
