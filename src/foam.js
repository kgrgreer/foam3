/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

(function() {
  var scripts = '';
  var foam = globalThis.foam = Object.assign({
    isServer: false,
    defaultFlags: {
      dev:   true,
      debug: true,
      java:  false,
      js:    true,
      node:  false,
      swift: false,
      web:   true
    },
    setupFlags: function() {
      var flags        = globalThis.foam.flags;
      var defaultFlags = foam.defaultFlags;

      for ( var key in defaultFlags )
        if ( ! flags.hasOwnProperty(key) )
          flags[key] = defaultFlags[key];


      if ( ! globalThis.document ) return;

      // Allow flags to be set in loading script tag.
      // Ex.: <script language="javascript" src="../../../foam.js" flags="u3,-debug"></script>
      var sflags = document.currentScript.getAttribute('flags');
      if ( sflags ) {
        sflags.split(',').forEach(f => {
          if ( f.startsWith('-') ) {
            flags[f.substring(1)] = false;
          } else {
            flags[f] = true;
          }
        });
      }
    },
    setup: function() {
      foam.setupFlags();

      // set flags by url parameters
      var urlParams = new URLSearchParams(window.location.search);
      for ( var pair of urlParams.entries() ) {
        globalThis.foam.flags[pair[0]] = (pair[1] == 'true');
      }

      var src  = document.currentScript && document.currentScript.src;
      var path = src && new URL(src).pathname || '';

      [path, globalThis.FOAM_BIN] = /^\/foam-bin(.)*\.js$/.test(path)
        ? ['/', path]
        : [path.substring(0, path.lastIndexOf('/foam.js') + 1)];

      if ( ! globalThis.FOAM_ROOT ) globalThis.FOAM_ROOT = path;

      foam.cwd = path;
      foam.main();
    },
    main: function() {
      var poms = (document.currentScript.getAttribute("project") || 'pom').split(',');

      // Reset foam cwd when loading project pom so that it can be configured
      // relative to the html file.
      foam.cwd = '';
      poms.forEach(pom => {
        foam.require(pom, false, true);
      });
    },
    checkFlags: function(flags) {
      if ( ! flags ) return true;

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
    },
    require: function(fn /* filename */, batch, isProject) {
      if ( fn ) {
        fn = foam.cwd + fn;
        if ( ! isProject && foam.seen(fn) ) return;
        scripts += '<script type="text/javascript" src="' + fn + '.js"></script>\n';
      }
      if ( ! batch || isProject ) {
        document.writeln(scripts);
        scripts = '';
      }
    },
    loadJSLibs: function(libs) {
      libs && libs.forEach(f => {
        var s = '<script type="text/javascript" src="' + f.name + '"';
        if ( f.defer ) s += ' defer';
        if ( f.async ) s += ' async';
        s += '></script>\n';

        document.writeln(s);
      });
    },
    flags:       {},
    loaded:      {},
    excluded:    {},
    seen:        function(fn) {
      if ( foam.loaded[fn] ) {
        console.warn(`Duplicated load of '${fn}'`);
        return true;
      }
      foam.loaded[fn] = true;
      return false;
    },
    adaptFlags: function(flags) {
      return typeof flags === 'string' ? flags.split('|') : flags;
    },
    checkForFlag: function (flags, desired) {
      if ( flags ) for ( var f of flags ) {
        if ( f.split('&').includes(desired) ) return true;
      }
      return false;
    },
    core: {},
    util:     {
      path: function(root, path, opt_ensure) {
        var a = path.split('.');

        for ( var i = 0 ; i < a.length ; i++ ) {
          var nextRoot = root[a[i]];
          if ( nextRoot === undefined ) {
            if ( opt_ensure ) {
              nextRoot = root[a[i]] = {};
            } else {
              return;
            }
          }
          root = nextRoot;
        }

        return root;
      }
    },
    locale: typeof navigator === 'undefined' ? 'en' : navigator.language,
    language: typeof navigator === 'undefined' ? 'en' : navigator.language.substring(0, 2),
    next$UID: (function() {
      /* Return a unique id. */
      var id = 1;
      return function next$UID() { return id++; };
    })(),
    SCRIPT: function(m) {
      m.class = '__Script__';

      // An instance of the script isn't useful at this point so just
      // execute the code. foam.SCRIPT can be overwritten later to
      // capture the details of the script if need be.

      // Only execute if the script's flags match the curren runtime flags.
      if ( foam.checkFlags(m.flags) ) {
        m.code();
        return;
      }

      m.code();
    },
    poms: [],
    POM: function(pom) {
      if ( globalThis.document ) {
        var src  = document.currentScript.src;
        var i    = src.lastIndexOf('/');
        foam.cwd = src.substring(0, i+1);
      }
      pom.location = foam.cwd;
      pom.path     = foam.sourceFile;
      foam.poms.push(pom);
      function loadFiles(files, isProjects) {
        files && files.forEach(f => {
          var name = f.name;
          f.flags  = foam.adaptFlags(f.flags);

          if ( ! foam.checkFlags(f.flags) ) return;

          if ( f.predicate && ! f.predicate() ) return;

          foam.currentFlags = f.flags || [];
          foam.require(name, ! isProjects, isProjects);
        });
      }

      pom.exclude && pom.exclude.forEach(f => {
        var path = foam.cwd + '/' + f + ".js";
        console.log('**************** EXCLUDING', path);
        foam.excluded[path] = true;
      });

      // TODO: requireModule vs requireFile -> require
      (foam.loadModules || loadFiles)(pom.projects, true);
      (foam.loadFiles   || loadFiles)(pom.files,    false);

      foam.require(null, false);

      foam.loadJSLibs(pom.JSLibs);
    },
    assert: console.assert.bind(console)
  }, globalThis.foam || {});

  foam.setup();
})();
