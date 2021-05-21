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
  package: 'net.nanopay.auth.ruler',
  name: 'LogoutUserAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `This rule action logs out a user.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      User user = (User) obj;

      // Update the amount spent in the limit state
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          logoutUser(x, user.getId());
        }
      },
      "Invalidating sessions for user " + user.toSummary() + ".");
      `
    },
    {
      name: 'logoutUser',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'userId',
          type: 'Long'
        }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO sessionDAO = (DAO) x.get("sessionDAO");
        sessionDAO.where(MLang.EQ(Session.USER_ID, userId))
          .select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              Session session = (Session) obj;
              User agent = ((Subject) session.getContext().get("subject")).getRealUser();
              if ( session.getUserId() == userId ||
                 ( agent != null && agent.getId() == userId ) )
              {
                auth.logout(session.getContext());
              }
            }
        });
      `
    }
  ]
});

