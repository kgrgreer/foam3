/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DaggerBootstrapDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'On bootstrap update, inform DaggerService - a hack onDAOUpdate listener',

  methods: [
    {
      name: 'put_',
      javaCode: `
      DaggerBootstrap old = (DaggerBootstrap) getDelegate().find_(x, obj);
      DaggerBootstrap nu = (DaggerBootstrap) getDelegate().put_(x, obj);
      if ( old == null ||
           nu.diff(old).size() > 0 ) {
        ((DaggerService) x.get("daggerService")).reconfigure(x, nu);
      }
      return nu;
      `
    }
  ]
});
