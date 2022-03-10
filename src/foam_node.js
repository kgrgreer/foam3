/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

(function() {
  var foam = globalThis.foam = { ...(globalThis.foam || {}), isServer: true, flags: globalThis.FOAM_FLAGS || {} };

  // Imports used by the loadServer() loader
  globalThis.imports      = {};
  globalThis.imports.path = require('path');
  globalThis.loadedFiles  = [];

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
      globalThis.loadedFiles.push(fn);
      (foam.require || require)(fn);
    }
  }

  this.FOAM_FILES = foam.POM = function(pom) {
    if ( Array.isArray(pom) ) pom = { projects: pom };

    var load  = loadServer();
    var seen  = {};
    var SAFE  = foam.SAFE || {};

    function loadFiles(files) {
      if ( ! files ) return;
      files.forEach(f => {
        var name = f.name;

        // TODO: fix when all files properly flagged
        /*
        if ( ! f.flags || ( ! f.flags.includes('swift') && ! f.flags.includes('node') ) ) {
          var caller = flags.src || __filename;
          var path   = caller.substring(0, caller.lastIndexOf('src/')+4);
        }
        if ( foam.checkFlags(f.flags) ) return true;
        */
        //return true;

        // Do we need this check? Is it already done elsewhere?
        if ( seen[name] ) {
          console.log('duplicate', name);
          return;
        }
        seen[name] = true;

        if ( f.predicate && ! f.predicate() ) return;

        foam = globalThis.foam;
        foam.currentFlags = f.flags || [];

        var count1 = Object.keys(foam.USED || {}).length + Object.keys(foam.UNUSED || {}).length;
        load(name);
        var count2 = Object.keys(foam.USED || {}).length + Object.keys(foam.UNUSED || {}).length;
        if ( count2 == count1 + 1 ) SAFE[name] = true;
      });
    }

    (foam.loadModules || loadFiles)(pom.projects);
    (foam.loadFiles   || loadFiles)(pom.files);

    foam.SAFE = SAFE;
  };

  loadServer()('files');
})();
