/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFDAO',
  extends: 'foam.box.sf.SF',
  implements: [ 'foam.dao.DAO' ],
  
  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'delegateNspecId',
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      transient: true
    }
  ],
  
  methods: [
    {
      name: 'put',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      return this.storeAndForward((FObject) obj);        
      `
    },
    {
      name: 'put_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      return this.storeAndForward((FObject) obj);        
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
      getDelegate().put(entry.getObject());
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
      DAO dao = (DAO) getX().get(getDelegateNspecId());
      if ( dao == null ) throw new RuntimeException("NspecId: " + getDelegateNspecId() + "Not Found!!");
      setDelegate(dao);
      `
    },
    {
      name: 'remove',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'remove' method");
      `
    },
    {
      name: 'remove_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'remove_' method");
      `
    },
    {
      name: 'find',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'find' method");
      `
    },
    {
      name: 'find_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'find_' method");
      `
    },
    {
      name: 'select',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'select' method");
      `
    },
    {
      name: 'select_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'select_' method");
      `
    },
    {
      name: 'removeAll',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'removeAll' method");
      `
    },
    {
      name: 'removeAll_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'removeAll_' method");
      `
    },
    {
      name: 'listen',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'listen' method");
      `
    },
    {
      name: 'listen_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'listen_' method");
      `
    },
    {
      name: 'pipe',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'pipe' method");
      `
    },
    {
      name: 'pipe_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'pipe_' method");
      `
    },
    {
      name: 'where',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'where' method");
      `
    },
    {
      name: 'orderBy',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'orderBy' method");
      `
    },
    {
      name: 'skip',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'skip' method");
      `
    },
    {
      name: 'limit',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'limit' method");
      `
    },
    {
      name: 'inX',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'inX' method");
      `
    },
    {
      name: 'cmd',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'cmd' method");
      `
    },
    {
      name: 'cmd_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'cmd_' method");
      `
    },
    {
      name: 'getOf',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new UnsupportedOperationException("SFDAO do not implement 'getOf' method");
      `
    },
  ]
})  