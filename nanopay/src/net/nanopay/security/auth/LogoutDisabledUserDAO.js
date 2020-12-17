/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'foam.nanos.auth.Subject',
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
      args: [
        { type: 'foam.nanos.auth.User', name: 'agent' },
        { type: 'foam.dao.DAO', name: 'entitiesDAO'}
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
      args: [
        { type: 'foam.nanos.auth.User', name: 'user' },
        { type: 'foam.nanos.auth.User', name: 'entity' }
      ],
      javaCode: `
        long userId = user.getId();
        sessionDAO_.where(
          MLang.EQ(Session.USER_ID, entity != null ? entity.getId() : userId)
        ).select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            Session session = (Session) obj;
            User agent = ((Subject) session.getContext().get("subject")).getRealUser();
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
