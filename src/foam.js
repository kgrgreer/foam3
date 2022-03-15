/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


(function() {
  var foam = globalThis.foam = {
    isServer: false,
    flags: globalThis.FOAM_FLAGS || {},

    // Are replaced when lib.js is loaded.
    adaptFlags: function() { return []; },
    checkFlags: function() { return true; }
  };

  if ( ! globalThis.FOAM_FLAGS ) globalThis.FOAM_FLAGS = foam.flags;
  var flags = globalThis.foam.flags;

  flags.web     = true;
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

  this.FOAM_FILES = foam.POM = async function(pom) {
    if ( Array.isArray(pom) ) pom = { files: pom };

    var jsLibs = pom.jsLib || [];
    var load   = createLoader();
    var seen   = {};

    function loadFiles(files) {
      if ( ! files ) return;
      files.forEach(f => {
        var name = f.name;
        f.flags = foam.adaptFlags(f.flags);

        // Do we need this check? Is it already done elsewhere?
        if ( seen[name] ) {
          console.log('duplicate', name);
          return;
        }
        seen[name] = true;

        if ( ! foam.checkFlags(f.flags) ) return;

        if ( f.predicate && ! f.predicate() ) return;

        load(name, true);
      });

      // force load, rather than just adding to batch
      load(null, false);
    }

    loadFiles(pom.projects);
    loadFiles(pom.files);

    jsLibs.forEach(f => {
      var s = '<script type="text/javascript" src="' + f.name + '"';
      if ( f.defer ) s += ' defer';
      if ( f.async ) s += ' async';
      s += '></script>\n';

      document.writeln(s);
    });
  };

  createLoader()(document.currentScript.getAttribute("project") || 'files', false);
})();
