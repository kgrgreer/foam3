/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

(function() {
  
    // Imports used by the loadServer() loader
    globalThis.imports = {}; globalThis.imports.path = require('path');

    var flags    = this.FOAM_FLAGS = this.FOAM_FLAGS || {};

    if ( ! flags.hasOwnProperty('node')  ) flags.node  = true;
    if ( ! flags.hasOwnProperty('web')   ) flags.web   = false;
    if ( ! flags.hasOwnProperty('java')  ) flags.java  = true;
    if ( ! flags.hasOwnProperty('swift') ) flags.swift = true;
    if ( ! flags.hasOwnProperty('debug') ) flags.debug = true;
    if ( ! flags.hasOwnProperty('js')    ) flags.js    = true;

    function loadServer() {
      var caller = flags.src || __filename;
      var path = caller.substring(0, caller.lastIndexOf('src/')+4);
  
      if ( ! globalThis.FOAM_ROOT ) globalThis.FOAM_ROOT = path;
  
      return function (filename) {
        if ( ! filename ) return;
        // Set document.currentScript.src, as expected by EndBoot.js
        let normalPath = globalThis.imports.path.relative(
          '.', globalThis.imports.path.normalize(path + filename + '.js'));
        globalThis.document = { currentScript: { src: normalPath } };
        require(path + filename + '.js');
      }
    }
  
    this.FOAM_FILES = async function(files) {
      var load = loadServer();
  
      files.
        map(function(f) { return f.name; }).
        forEach(f => load(f, true));
  
      load(null, false);
  
    //  delete this.FOAM_FILES;
    };
  
    loadServer()('files', false);
  })();
