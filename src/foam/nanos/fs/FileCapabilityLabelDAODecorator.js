/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileCapabilityLabelDAODecorator',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'Decorator to add labels from capability to file',

  methods: [
    {
      name: 'put_',
      javaCode: `
        int a = 8;
        return super.put_(x, obj);
      `
    }
  ]
})
