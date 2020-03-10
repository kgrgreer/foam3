foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'BusinessEmployeeDAO',
  extends: 'foam.dao.ReadOnlyDAO',
  flags: ['java'],

  documentation: `

  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        return getCurrentUser(x);
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink s = sink != null ? sink : new ArraySink();
        ProxySink proxy = new ProxySink(x, s) {
          public void put(Object o, Detachable d) {
            getDelegate().put(getCurrentUser(x), d);
          }
        };

        getDelegate().select_(x, proxy, skip, limit, order, predicate);

        // Return the proxy's delegate - the caller may explicitly be expecting
        // this array sink they passed.  See foam.dao.RequestResponseClientDAO
        return proxy.getDelegate();
      `
    },
    {
      name: 'getCurrentUser',
      type: 'foam.nanos.auth.User',
      args: [
        { name: 'x', type: 'Context' },
      ],
      javaCode: `
        return (User) x.get("user");
      `
    }
  ]
});
