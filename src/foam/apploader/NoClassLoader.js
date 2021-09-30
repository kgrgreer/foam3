/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: "foam.apploader",
  name: "NoClassLoaderContext",

  exports: [
    'classloader'
  ],

  properties: [
    {
      name: "classloader",
      factory: function() {
        return {
          load: function(id) {
            var cls = foam.maybeLookup(id);
            return cls ? Promise.resolve(cls) : Promise.reject('No classloader enabled.');
          },
          addClassPath: function(){},
          maybeLoad: function(id) { return this.load(id).catch(function() { return null; }); },
          latch: function() {}
        };
      }
    }
  ]
});


foam.SCRIPT({
  package: 'foam.apploader',
  name: 'NoClassLoaderContextScript',

  requires: [
    'foam.apploader.NoClassLoaderContext',
  ],

  code: function() {
    var classLoaderContext = foam.apploader.NoClassLoaderContext.create(
        null, foam.__context__);
    foam.__context__ = classLoaderContext.__subContext__;
  }
});
