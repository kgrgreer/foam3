/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'RestrictedApprovableDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Restricts the daoKey and localDaoKey of approvables
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable'
  ],

  // ???: Should this be the default for ProxyDAOs?
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public RestrictedApprovableDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'String',
      name: 'serverDaoKey'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof Approvable ) ) {
          return super.put_(x, obj);
        }

        var approvable = (Approvable) obj;
        approvable.setDaoKey(getDaoKey());
        approvable.setServerDaoKey(getServerDaoKey());

        return super.put_(x, obj);
      `
    }
  ]
});
