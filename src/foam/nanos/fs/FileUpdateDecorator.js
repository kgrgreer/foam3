/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileUpdateDecorator',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Object id = obj.getProperty("id");
        FObject oldObj = getDelegate().find(id);
        boolean isCreate = id == null || oldObj == null;

        if ( ! isCreate ) return obj;

        return getDelegate().put_(x, obj);
      `
    }
  ]
})
