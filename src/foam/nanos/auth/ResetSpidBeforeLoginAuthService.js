/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ResetSpidBeforeLoginAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: `
    Reset context spid to avoid spid restrictions during login process.
  `,

  methods: [
    {
      name: 'login',
      javaCode: 'return getDelegate().login(x.put("spid", null), identifier, password);'
    }
  ]
});
