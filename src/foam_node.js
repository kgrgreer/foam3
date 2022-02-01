/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

(function() {
  var foam = globalThis.foam || ( globalThis.foam = {} );

  // Imports used by the loadServer() loader
  globalThis.imports = {};
  globalThis.imports.path = require('path');

  // Also appears in foam.js, manually keep two copies in sync
  foam.checkFlags = function(flags) {
    if ( ! flags || flags.length == 0 ) return true;
    if ( typeof flags === 'string' ) {
      flags = flags.split('|');
    }

    function and(fs) {
      fs = fs.split('&');
      for ( var i = 0 ; i < fs.length ; i++ ) {
        if ( ! foam.flags[fs[i]] ) return false;
      }
      return true;
    }

    // OR AND clauses
    for ( var i = 0 ; i < flags.length ; i++ ) {
      if ( and(flags[i]) ) return true;
    }
    return false;
  }

  if ( ! this.FOAM_FLAGS ) this.FOAM_FLAGS = {};
  var flags = globalThis.foam.flags = this.FOAM_FLAGS;

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
      // console.log('Loading...', filename);
      // Set document.currentScript.src, as expected by EndBoot.js
      let normalPath = globalThis.imports.path.relative(
        '.',
        globalThis.imports.path.normalize(path + filename + '.js'));
      globalThis.document = { currentScript: { src: normalPath } };
      require(path + filename + '.js');
    }
  }

  this.FOAM_FILES = function(files) {
    var load = loadServer();
    var seen = {};
    var SAFE = foam.SAFE || {};
    files.
      filter(f => {
        if ( foam.checkFlags(f.flags) ) return true;
//        console.log('****************************** NOT LOADING ', f.name, f.flags);
        return true;
      }).
      filter(f => { if ( seen[f.name] ) { console.log('duplicate', f.name); return false; } seen[f.name] = true; return true; }).
      filter(f => (! f.predicate) || f.predicate()).
      forEach(function(f) {
        foam = globalThis.foam;
        foam.currentFlags = f.flags || [];

        // console.log('******* LOADING WITH FLAGS ', f.name, globalThis.foam.currentFlags);
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
