/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'PingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: '',

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof PingCmd ) {
        PingCmd cmd = (PingCmd) obj;
        cmd.setEcho(System.currentTimeMillis());
        return cmd;
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
