/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ProxyUserLocatorService',

  implements: [
    'foam.nanos.auth.UserLocatorService'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName',
      expression: function(delegate$serviceName) {
        return delegate$serviceName
      },
      setter: function(n) {
        this.delegate.serviceName = n;
      },
    },
    {
      class: 'Proxy',
      of: 'foam.nanos.auth.UserLocatorService',
      name: 'delegate'
    }
  ]
});
