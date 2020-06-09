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
  package: 'net.nanopay.model',
  name: 'BusinessUserJunctionRefinement',
  refines: 'net.nanopay.model.BusinessUserJunction',

  documentation: `
    A junction between a Business and User means that the user is a signing
    officer for the business.
  `,

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',

    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = ((Subject) x.get("subject")).getUser();

        if ( auth.check(x, "*") ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses may assign signing officers.");
        }

        if ( getSourceId() != user.getId() ) {
          throw new AuthorizationException("Users may not assign themselves as signing officers of businesses. The business must assign the user as a signing officer.");
        }

        checkQuebec(x);
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();

        if ( auth.check(x, "*") ) return;

        // Checks if either the user or agent is associated with the junction.
        if (
          getSourceId() != user.getId() &&
          getTargetId() != user.getId() &&

          agent != null &&
          (
            getSourceId() != agent.getId() &&
            getTargetId() != agent.getId()
          )
        ) {
          throw new AuthorizationException("Permission denied. You are not associated with this junction.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( auth.check(x, "*") || auth.check(x, "onboarding.update.*") ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses may assign signing officers.");
        }

        if ( getSourceId() != user.getId() ) {
          throw new AuthorizationException("Users may not assign themselves as signing officers of businesses. The business must assign the user as a signing officer.");
        }

        checkQuebec(x);
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();

        if ( auth.check(x, "*") ) return;

        // Checks if either the user or agent is associated with the junction.
        if (
          getSourceId() != user.getId() &&
          getTargetId() != user.getId() &&

          agent != null &&
          (
            getSourceId() != agent.getId() &&
            getTargetId() != agent.getId()
          )
        ) {
          throw new AuthorizationException("Permission denied. You are not associated with this junction.");
        }
      `
    },
    {
      name: 'checkQuebec',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        // Temporarily prohibit signing officers living in Quebec.
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        User signingOfficer = (User) localUserDAO.inX(x).find(getSourceId());

        if ( signingOfficer != null ) {
          Address address = signingOfficer.getAddress();

          if ( address != null && SafetyUtil.equals(address.getRegionId(), "QC") ) {
            throw new IllegalStateException("Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.");
          }
        }
      `
    }
  ]
});
