/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'PushRegistryAgent',

  documentation: 'Client-side NSpec which calls PushRegistry with subscription information.',

  imports: [ 'pushRegistry' ],

  methods: [
    function init() {
      var sub = globalThis.__PUSH_SUBSCRIPTION__;
      if ( ! sub ) return;

      globalThis.__PUSH_SUBSCRIPTION__ = undefined;

      var endpoint = sub.endpoint;
      var key      = sub.keys.p256dh;
      var auth     = sub.keys.auth;

      console.log('PushRegistryAgent executed.');
      this.pushRegistry.subscribe(x, endpoint, key, auth);
    }
  ]
});
