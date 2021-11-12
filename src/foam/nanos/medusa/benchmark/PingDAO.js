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

  constants: [
    {
      name: 'PING',
      type: 'String',
      value: 'PING'
    }
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( obj != null &&
           PING.equals(obj.toString()) )  {
        return System.currentTimeMillis();
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
