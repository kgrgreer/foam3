foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'LogoutDisabledUserDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that logs out the user who is being disabled.`,

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'net.nanopay.admin.model.AccountStatus'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        if (
          oldUser != null
          && AccountStatus.DISABLED != oldUser.getStatus()
          && AccountStatus.DISABLED == newUser.getStatus()
        ) {
          sessionDAO_ = (DAO) x.get("localSessionDAO");
          auth_ = (AuthService) x.get("auth");

          logoutUser(newUser, null);
          logoutAgent(newUser, newUser.getEntities(x).getDAO());
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'logoutAgent',
      javaReturns: 'void',
      args: [
        { of: 'User', name: 'agent' },
        { of: 'DAO', name: 'entitiesDAO'}
      ],
      javaCode: `
        entitiesDAO.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            logoutUser(agent, (User) obj);
          }
        });
      `
    },
    {
      name: 'logoutUser',
      javaReturns: 'void',
      args: [
        { of: 'User', name: 'user' },
        { of: 'User', name: 'entity' }
      ],
      javaCode: `
        long userId = user.getId();
        sessionDAO_.where(
          MLang.EQ(Session.USER_ID, entity != null ? entity.getId() : userId)
        ).select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            Session session = (Session) obj;
            User agent = (User) session.getContext().get("agent");
            if ( session.getUserId() == userId
              || (agent != null && agent.getId() == userId)
            ) {
              auth_.logout(session.getContext());
            }
          }
        });
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private DAO sessionDAO_;
          private AuthService auth_;
        `);
      }
    }
  ],
});
