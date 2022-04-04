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
    'foam.core.FObject',
    'foam.nanos.fs.File'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Object id = obj.getProperty("id");
        FObject oldObj = getDelegate().find(id);
        
        // Restrict file update unless lifecycleState changed
        if ( oldObj != null && File.LIFECYCLE_STATE.compare(obj, oldObj) == 0 ) {
          return obj;
        }

        return getDelegate().put_(x, obj);
      `
    }
  ]
})
