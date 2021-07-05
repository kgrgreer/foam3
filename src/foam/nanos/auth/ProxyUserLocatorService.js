/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ProxyUserLocatorService',

  implements: ['foam.nanos.auth.UserLocatorService'],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.auth.UserLocatorService',
      name: 'delegate'
    }
  ]
});
