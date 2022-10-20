/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 var path_ = require('path');

globalThis.foam = {
  isServer: true,
  defaultFlags: {
    node:  false,
    java:  true,
    swift: false,
    debug: true,
    js:    true,
    // TODO: the following two shouldn't be needed and should be removed when possible
    sql:   true,
    // Needed because flinks code uses but needs to be compiled to java
    web:   true
  },
  setup:    function() {
    this.setupFlags();
  },
  cwd: process.cwd(),
  /*
  checkFlags: function(flags) {
    if ( ! flags ) return true;

    if ( flags.includes('swift') ) return false;

    if ( flags.includes('node') ) return false;

    return true;
  },
  */
  require: function (fn, batch, isProject, webFoam) {
    if ( ! fn ) return;

    // ???: foam.resolve()?
    var cwd = foam.cwd;
    try {
      var path = path_.resolve(foam.cwd, fn) + '.js';
      if ( ! isProject && globalThis.foam.seen(path) ) return;
      foam.cwd = path_.dirname(path);
      foam.sourceFile = path;
      require(path);
    } finally {
      foam.cwd = cwd;
    }
  },
  loadJSLibs: function(libs) {
    /* NOP */
  }
};

require('./foam.js');
