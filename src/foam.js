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
  var foam = globalThis.foam || ( globalThis.foam = { isServer: false, flags: globalThis.FOAM_FLAGS || {} } );

  // Is replaced when lib.js is loaded.
  foam.checkFlags = () => true;

  if ( ! globalThis.FOAM_FLAGS ) globalThis.FOAM_FLAGS = foam.flags;
  var flags = globalThis.foam.flags;

  flags.web  = true;
  flags.genjava = true;

  if ( ! flags.hasOwnProperty('debug') ) flags.debug = true;
  if ( ! flags.hasOwnProperty('js')    ) flags.js    = true;

  // TODO: fix, needed to run web client for some reason
  if ( ! flags.hasOwnProperty('java')  ) flags.java = true;

  // set flags by url parameters
  var urlParams = new URLSearchParams(window.location.search);
  for ( var pair of urlParams.entries() ) {
    flags[pair[0]] = (pair[1] == 'true');
  }

  function createLoader() {
    var path = document.currentScript && document.currentScript.src;
    // document.currentScript isn't supported on all browsers, so the following
    // hack gets the job done on those browsers.
    if ( ! path ) {
      var scripts = document.getElementsByTagName('script');
      for ( var i = 0 ; i < scripts.length ; i++ ) {
        if ( scripts[i].src.match(/\/foam.js$/) ) {
          path = scripts[i].src;
          break;
        }
      }
    }

    path = path && path.length > 3 && path.substring(0, path.lastIndexOf('src/')+4) || '';
    if ( ! globalThis.FOAM_ROOT ) globalThis.FOAM_ROOT = path;

    var loadedMap = {};
    var scripts   = '';

    return function(filename, opt_batch) {
      if ( filename && loadedMap[filename] ) {
        console.warn(`Duplicated load of '${filename}'`);
        return;
      }
      loadedMap[filename] = true;
      if ( filename ) {
        scripts += '<script type="text/javascript" src="' + path + filename + '.js"></script>\n';
      }
      if ( ! opt_batch ) {
        document.writeln(scripts);
        scripts = '';
      }
    };
  }

  this.FOAM_FILES = async function(files) {
    var load = createLoader();

    var seen = {};
    files.forEach(f => {
      if ( seen[f.name] ) {
        console.log('duplicate', f.name);
        return;
      }
      seen[f.name] = true;

      if ( ! foam.checkFlags(f.flags) ) return;

      if ( f.predicate && ! f.predicate() ) return;

      load(f.name, true);
    });

    load(null, false);
  //  delete this.FOAM_FILES;
  };

  createLoader()('files', false);
})();
