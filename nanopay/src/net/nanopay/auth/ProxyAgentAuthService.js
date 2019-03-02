/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ProxyAgentAuthService',

  implements: [
    'foam.nanos.auth.AgentAuthService'
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
      of: 'foam.nanos.auth.AgentAuthService',
      name: 'delegate'
    }
  ]
});
