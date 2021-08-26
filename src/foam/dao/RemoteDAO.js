/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.dao',
  name: 'RemoteDAO',
  extends: 'foam.dao.ProxyDAO',

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
            public RemoteDAO(X x, DAO delegate, DAO internalAccessPoint) {
              super(x, delegate);
              do {
                if ( ! ( internalAccessDelegate_ instanceof ProxyDAO ) ) throw new IllegalArgumentException("internalAccessPoint");
                internalAccessDelegate_ = ((ProxyDAO)internalAccessDelegate_).getDelegate();
              } while ( internalAccessDelegate_.getClass() != internalAccessPoint.getClass() );
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
      return ((Subject) x.get("subject")).getUser().getId() == 1 ? getInternalAccessDelegate() : getDelegate();
      `
    }
  ]
});
