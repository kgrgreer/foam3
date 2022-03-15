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

/**
 * Top-Level of foam package
 */
foam = {
  flags: {},
  isServer: false,
  ...(globalThis.hasOwnProperty('foam') ? globalThis.foam : {
    // from a static build, models have already been filtered so checkFlags can be a NOP
    // checkFlags: function(flags) { return true; }
  }),
  core: {},
  adaptFlags: function(flags) {
    return typeof flags === 'string' ? flags.split('|') : flags;
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
  checkForFlag: function (flags, desired) {
    if ( flags ) for ( var f of flags ) {
      if ( f.split('&').includes(desired) ) return true;
    }
    return false;
  },
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
  language: typeof navigator === 'undefined' ? 'en' : navigator.language,
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
    if ( foam.checkFlags(this.flags ) ) {
      m.code();
      return;
    }

    m.code();
  }
};


Object.defineProperty(
  Object.prototype,
  '$UID',
  {
    get: function() {
      if ( ! Object.hasOwnProperty.call(this, '$UID__') &&
           ! Object.isFrozen(this) ) {
        Object.defineProperty(
            this,
            '$UID__',
            {value: foam.next$UID(), enumerable: false});
      }
      return this.$UID__;
    },
    enumerable: false
  }
);


/**
 * Check for the FOAMLINK_DATA globalThis. If it is set, FOAMLink will be
 * enabled in the server-side classloader
 */
if ( typeof globalThis.FOAMLINK_DATA !== 'undefined' ) {
  foam.hasFoamlink = true;
  foam.foamlink = {
    dataFile: globalThis.FOAMLINK_DATA
  };
}

foam.assert = console.assert.bind(console);

/**
 * Creates a small library in the foam package. A LIB is a collection of
 * constants and static methods.
 * <pre>
foam.LIB({
  name: 'network',
  constants: {
    PORT: 4000
  },
  methods: [ function sendPacket() { ... }  ]
});
</pre>
Produces <code>foam.network</code>:
<pre>
console.log(foam.network.PORT); // outputs 4000
foam.network.sendPacket();
</pre>
 * @method LIB
 * @memberof module:foam
 */
foam.LIB = function LIB(model) {
  var root = foam.util.path(globalThis, model.name, true);

  if ( model.constants ) {
    foam.assert(
      typeof model.constants === 'object',
      'Constants must be a map.');

    for ( var key in model.constants ) {
      var v = root[key] = model.constants[key];
      if ( foam.Object.isInstance(v) && v.class ) {
        v = foam.lookup(v.class).create(v);
      }
      root[key] = v;
    }
  }

  if ( model.methods ) {
    foam.assert(Array.isArray(model.methods), 'Methods must be an array.');

    for ( i = 0 ; i < model.methods.length ; i++ ) {
      var m = model.methods[i];

      foam.assert(
        typeof m === 'object' || typeof m === 'function',
        'Methods must be a map of a function');

      foam.assert(
         typeof m !== 'object' || typeof m.code === 'function',
        'Methods must have a code key which is a function');

      var name = m.name || foam.Function.getName(m);
      foam.assert(name, 'Methods must be named with a non-empty string');

      root[name] = m.code || m;
    }
  }
};
