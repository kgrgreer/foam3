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
  package: 'net.nanopay.business',
  name: 'EnforceOneBusinessAdminDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    This DAO decorator ensures that there is only one person in a Business that
    can make payments after submitting onboarding.

    When a person signs up for Ablii, they create a User and a Business. They
    become the admin for that business. However, if that person is not a signing
    officer for the business, they must invite a signing officer to join the
    business. When the signing officer signs up and completes the business
    profile, they will become a new admin for the company and this decorator
    will ensure that the person who signed up is demoted to an employee because
    we don't want them to be able to make payments. This use case is the reason
    this decorator was created.
  `,

  imports: [
    'DAO agentJunctionDAO',
    'DAO localBusinessDAO',
    'DAO groupDAO',
    'DAO localSessionDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.util.List',
    'javax.security.auth.AuthPermission',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        UserUserJunction junction = (UserUserJunction) obj;
        DAO localBusinessDAO = ((DAO) getLocalBusinessDAO()).inX(x);
        DAO agentJunctionDAO = ((DAO) getAgentJunctionDAO()).inX(x);

        // We only care about members of businesses in this decorator.
        Business business = (Business) localBusinessDAO.find(junction.getTargetId());
        if ( business == null ) return super.put_(x, obj);

        Group group = junction.findGroup(x);

        if ( group == null ) {
          throw new RuntimeException("Could not find the junction group.");
        }

        if ( canMakePayments(x, junction.getGroup()) ) {
          DAO sessionDAO = ((DAO) getLocalSessionDAO()).inX(x);
          List<UserUserJunction> others = ((ArraySink) agentJunctionDAO
            .where(EQ(UserUserJunction.TARGET_ID, business.getId()))
            .select(new ArraySink())).getArray();

          for ( UserUserJunction j : others ) {
            if ( canMakePayments(x, j.getGroup()) ) {
              // Demote to an employee, which can't make payments.
              j = (UserUserJunction) j.fclone();
              j.setGroup(business.getBusinessPermissionId() + ".employee");
              agentJunctionDAO.put(j);

              // Update session so if they are currently logged in, they can't
              // continue using their admin privileges since we just demoted
              // them.
              List<Session> sessions = ((ArraySink) sessionDAO
                .where(
                  AND(
                    EQ(Session.USER_ID, j.getTargetId()),
                    EQ(Session.AGENT_ID, j.getSourceId())
                  )
                )
                .select(new ArraySink())).getArray();

              for ( Session session : sessions ) {
                X ctx = session.getContext();
                session.setContext(ctx.put("group", j.findGroup(x)));
                sessionDAO.put(session);
              }
            }
          }
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'canMakePayments',
      type: 'boolean',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'groupId', type: 'String' }
      ],
      javaCode: `
        if ( SafetyUtil.isEmpty(groupId) ) return false;

        DAO groupDAO = ((DAO) getGroupDAO()).inX(x);

        while ( ! SafetyUtil.isEmpty(groupId) ) {
          Group group = (Group) groupDAO.find(groupId);

          if ( group == null || ! group.getEnabled() ) return false;

          if ( group.implies(x, new AuthPermission("business.invoice.pay")) ) return true;

          groupId = group.getParent();
        }

        return false;
      `
    }
  ]
});
