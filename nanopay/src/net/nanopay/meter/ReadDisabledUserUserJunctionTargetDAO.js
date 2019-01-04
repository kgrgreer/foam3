foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'ReadDisabledUserUserJunctionTargetDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Filter out junction whose target entity status is disabled.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ProxySink',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'net.nanopay.admin.model.AccountStatus',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        return read(x, super.find_(x, id));
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink decoratedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              FObject result = read(getX(), (FObject) obj);
              if ( result != null ) {
                super.put(result, sub);
              }
            }
          };
          super.select_(x, decoratedSink, skip, limit, order, predicate);
          return sink;
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'read',
      javaReturns: 'UserUserJunction',
      args: [
        { of: 'foam.core.X', name: 'x' },
        { of: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        UserUserJunction result = (UserUserJunction) obj;
        User target = result.findTargetId(x);
        AuthService auth = (AuthService) x.get("auth");

        if ( target != null
          && target.getStatus().equals(AccountStatus.DISABLED)
          && ! auth.check(x, "userUserJunction.read.disabledTarget")
        ) {
          return null;
        }
        return result;
      `
    }
  ]
});
