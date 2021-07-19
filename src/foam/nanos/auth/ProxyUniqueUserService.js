/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ProxyUniqueUserService',

  implements: ['foam.nanos.auth.UniqueUserService'],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.auth.UniqueUserService',
      name: 'delegate'
    }
  ]
});
