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
  package: 'net.nanopay.auth',
  name: 'BusinessAgentAuthService',
  extends: 'net.nanopay.auth.ProxyAgentAuthService',

  documentation: 'Allows users to act as businesses and regular users.',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'DAO agentJunctionDAO',
    'DAO localUserDAO',
    'DAO groupDAO'
    ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.NanoService',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',

    'net.nanopay.admin.model.AccountStatus',
    'foam.nanos.auth.AgentJunctionStatus',
    'net.nanopay.contacts.PersonalContact',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NOT'
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        if ( getDelegate() instanceof NanoService ) {
          ((NanoService) getDelegate()).start();
        }
      `
    },
    {
      name: 'actAs',
      javaCode: `
        User user  = (User) getLocalUserDAO().find(entity.getId());
        if ( user instanceof PersonalContact ) {
          throw new RuntimeException("You cannot act as a contact.");
        }

        User agent = ((Subject) x.get("subject")).getRealUser();

        // Make sure you're logged in as yourself before trying to act as
        // someone else.
        if ( agent == null ) {
          throw new AuthenticationException();
        }

        if ( ! canActAs(x, agent, user) ) {
          return null;
        }

        return getDelegate().actAs(x, entity);
      `
    },
    {
      name: 'canActAs',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'agent',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'entity',
          type: 'foam.nanos.auth.User',
        }
      ],
      javaCode: `
        // check entity status is not disabled
        if ( AccountStatus.DISABLED == entity.getStatus() ) {
          throw new AuthorizationException("Entity is disabled.");
        }

        return getDelegate().canActAs(x, agent, entity);
      `
    },
    {
      name: 'logout',
      javaCode: 'getDelegate().logout(x);'
    }
  ]
});

