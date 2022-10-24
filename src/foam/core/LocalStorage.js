/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.SCRIPT({
  package: 'foam.core',
  name: 'LocalStorageScript',

  code: function(){
    (function() {
      try {
        var test = '_test';
        globalThis.localStorage.setItem(test, test);
        globalThis.localStorage.removeItem(test);
      } catch (e) {
        var Storage = {
          getItem:    function(k)    { return this[k] },
          setItem:    function(k, v) { this[k] = v; },
          removeItem: function(k)    { delete this[k]; },
          clear:      function()     { for ( const k in this ) delete this[k]; }
        };
        var localStorage_ = Object.create(Storage);

        // Redefine global localStorage since it was inaccessible due to cross
        // origin access restriction by browser eg. the main url and iframe url
        // are pointing to different origin (domain).
        Object.defineProperty(globalThis, 'localStorage', { value: localStorage_ });
      }
    })();
  }
});
