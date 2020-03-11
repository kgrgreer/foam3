foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'BusinessEmployeeDAO',
  extends: 'foam.dao.ReadOnlyDAO',
  flags: ['java'],

  documentation: `
    DAO decorator that filters out all the users
    not associated with the current user
  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'foam.nanos.auth.UserUserJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        Sink s = sink != null ? sink : new ArraySink();
        ProxySink proxy = new ProxySink(x, s) {
          public void put(Object o, Detachable d) {
            User user = (User) o;
            if ( isEmployee(x, user) ) {
              getDelegate().put(user, d);
            }
          }
        };

        getDelegate().select_(x, proxy, skip, limit, order, predicate);

        // Return the proxy's delegate - the caller may explicitly be expecting
        // this array sink they passed.  See foam.dao.RequestResponseClientDAO
        return proxy.getDelegate();
      `
    },
    {
      name: 'isEmployee',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'foam.nanos.auth.User' }
      ],
      javaCode: `
        if (user == null) return false; 

        User business = (Business) x.get("user");
        DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
        UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(
          AND(
            EQ(UserUserJunction.SOURCE_ID, user.getId()),
            EQ(UserUserJunction.TARGET_ID, business.getId())
          )
        );
        return junction != null;
      `
    }
  ]
});
