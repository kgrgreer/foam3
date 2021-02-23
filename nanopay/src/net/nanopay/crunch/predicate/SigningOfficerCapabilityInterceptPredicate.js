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
  package: 'net.nanopay.crunch.predicate',
  name: 'SigningOfficerCapabilityInterceptPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: `Returns true if current 'agent' (user) has an signingofficerjunction with 'user' (business) `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.crunch.onboardingModels.SigningOfficerQuestion',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        User agent = ((Subject) x.get("subject")).getRealUser();
        User user = ((Subject) x.get("subject")).getUser();

        if ( agent == null || user == null || ! ( agent instanceof User ) || ! ( user instanceof Business ) ) return false;

        UserCapabilityJunction soqJunction = crunchService.getJunction(x, "554af38a-8225-87c8-dfdf-eeb15f71215f-0");
        if ( soqJunction == null || soqJunction.getStatus() != CapabilityJunctionStatus.GRANTED ||
           ( ! ((SigningOfficerQuestion) soqJunction.getData()).getIsSigningOfficer() ) 
        ) return false;

        // do not intercept if the ucj is pending review
        AgentCapabilityJunction signingOfficerPrivilegesJunction = (AgentCapabilityJunction) userCapabilityJunctionDAO.find(
          AND(
            INSTANCE_OF(AgentCapabilityJunction.class),
            EQ(UserCapabilityJunction.SOURCE_ID, agent.getId()),
            OR(
              EQ(UserCapabilityJunction.TARGET_ID, "554af38a-8225-87c8-dfdf-eeb15f71215f-1a5"),
              EQ(UserCapabilityJunction.TARGET_ID, "554af38a-8225-87c8-dfdf-eeb15f71215f-1a5-us"),
              EQ(UserCapabilityJunction.TARGET_ID, "777af38a-8225-87c8-dfdf-eeb15f71215f-123")
            ),
            EQ(AgentCapabilityJunction.EFFECTIVE_USER, user.getId()),
            OR(
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.PENDING)
            )
          )
        );
        return signingOfficerPrivilegesJunction == null;
      `
    }
  ]
});
