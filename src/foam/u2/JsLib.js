/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'JsLib',

  documentation: 'Axiom to install a JS Library on demand.',

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
      var oldRender = proto.render, self = this;

      proto.render = async function() {
        await self.installLib();
        oldRender.apply(this, arguments);
      }
    },

    function installLib() {
      if ( ! document ) return;
      var installedStyles = document.installedStyles || ( document.installedStyles = {} );
      if ( ! this.LOADED[this.name] ) {
        var self = this;
        this.LOADED[this.name] = new Promise(function(resolve, reject) {
          var id = foam.next$UID();
          let e  = document.createElement('script')
          e.setAttribute('id', id)
          e.setAttribute('src', self.src)
          document.body.appendChild(e);
          e.onload = function() {
            resolve(true);
          };
        });
      }
      return this.LOADED[this.name];
    }
  ]
});
