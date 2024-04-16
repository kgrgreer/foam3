/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'JsLib',

  documentation: 'Axiom to install a JS Library on demand.',

  // If a Content Security Policy (CSP) is being used, and the library is from
  // another site, like a CDN, then the library will needed to be added
  // to the CSP's 'script-src'. In NANOS, this is done in the HttpServer
  // config.

  constants: {
    LOADED: {} // loaded libraries
  },

  properties: [
    {
      class: 'String',
      name: 'src'
    },
    {
      name: 'name',
      factory: function() { return 'JsLib-' + this.src; }
    },
    [ 'priority', 20 ]
  ],

  methods: [
    function installInProto(proto) {
      var self = this;

      var oldRender = proto.render;
      if ( oldRender ) {
        proto.render = async function() {
          await self.installLib();
          oldRender.apply(this, arguments);
        }
      }

      var oldPaint = proto.paintSelf;
      if ( oldPaint ) {
        proto.paintSelf = async function() {
          await self.installLib();
          oldPaint.apply(this, arguments);
        }
      }
    },

    function installLib() {
      if ( ! document ) return;
      var installedStyles = document.installedStyles || ( document.installedStyles = {} );
      if ( ! this.LOADED[this.name] ) {
        var self = this;
        this.LOADED[this.name] = new Promise(function(resolve, reject) {
          var id = foam.next$UID();
          let e  = document.createElement('script');
          e.setAttribute('id',   id);
          e.setAttribute('type', 'text/javascript');
          e.setAttribute('src',  self.src);
          document.body.appendChild(e);
          // On a failure to load the library we still want to resolve the
          // promise so that the object can still be created.
          e.onload = e.onerror = () => resolve(true);
        });
      }

      return this.LOADED[this.name];
    }
  ]
});
