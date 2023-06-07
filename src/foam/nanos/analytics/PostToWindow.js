/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'PostToWindow',
  documentation: 'Client side service that provides interface for postMessage',
  imports: ['window'],

  properties: [
    {
      class: 'Boolean',
      name: 'isIframe',
      factory: function() {
        try {
          return globalThis.self !== globalThis.top;
        } catch (e) {
          return false;
        }
      }
    }
  ],
  methods: [
    function post(mes, target) {
      if ( ! this.isIframe ) return;
      let t = target ?? '*';
      this.window.parent.postMessage(mes, t);
    }
  ]
});
