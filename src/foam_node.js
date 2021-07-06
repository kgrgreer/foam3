/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  
    // Imports used by the loadServer() loader
    globalThis.imports = {}; globalThis.imports.path = require('path');

    var flags    = this.FOAM_FLAGS = this.FOAM_FLAGS || {};

    flags.node   = true;
    flags.web    = false;
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
