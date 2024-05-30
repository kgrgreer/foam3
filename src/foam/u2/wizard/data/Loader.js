/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard.data',
  name: 'Loader',
  proxy: false,

  methods: [
    {
      name: 'load',
      async: true
    }
  ]
});


foam.CLASS({
  package:    'foam.u2.wizard.data',
  name:       'ProxyLoader',
  implements: [ 'foam.u2.wizard.data.Loader' ],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.u2.wizard.data.Loader',
      name: 'delegate',
      transient: true,
      fromJSON: function(v) { return v; },
      factory: function() {
        if ( ! this.delegate_ ) return undefined;
        return this.delegate_$create({}, this.__subContext__);
      },
      setter: function(v) {
        if ( foam.core.FObject.isInstance(v) || v == null ) {
          this.instance_['delegate'] = v;
          return;
        }
        this.delegate_ = v;
        this.clearProperty('delegate');
      }
    },
    {
      class: 'foam.util.FObjectSpec',
      name: 'delegate_'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'NullLoader',
  implements: [ 'foam.u2.wizard.data.Loader' ],

  methods: [
    function load({ old }) {
      return old || null;
    }
  ]
});
