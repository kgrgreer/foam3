/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.dao',
  name: 'PrivilegedDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `PrivilegedDAO is meant to be a wrapper for another DAO.
    internalAccessPoint DAO property defines the DAO that would be returned for users in "admin" and "system" groups.
    Created to automatically bypass DAOs that are not necessary for fully authorized users(system, admin).
    Another way to call someDAO vs localSomeDAO. If the service is wrapped around PrivilegedDAO, then client should not
    care which one to call and always call for someDAO and the PrivilegedDAO would decide whether it needs to be authenticated dao or not.`,

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.core.X'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public PrivilegedDAO(X x, DAO delegate, DAO internalAccessPoint) {
              setX(x);
              setDelegate(delegate);
              setInternalAccessDelegate(internalAccessPoint);
            }
            `
        }));
      }
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      name: 'internalAccessDelegate'
    }
  ],

  methods: [
    {
      name: 'find_',
      flags: null,
      javaCode: `
      return calculateDAO(x).find_(x, id);
      `
    },
    {
      name: 'put_',
      javaCode: `
      return calculateDAO(x).put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return calculateDAO(x).remove_(x, obj);
      `
    },

    {
      name: 'calculateDAO',
      type: 'DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      javaCode: `
      return ((Subject) x.get("subject")).getUser().getGroup().equals("system") ? getInternalAccessDelegate() : getDelegate();
      `
    }
  ]
});
