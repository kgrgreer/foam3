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
  package: 'net.nanopay.business.ruler',
  name: 'InitialBusinessRegistrationRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Creates business when initial business capability is submitted.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AgentAuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.crunch.onboardingModels.InitialBusinessData',
    'net.nanopay.model.Business'
  ],

  messages: [
    { name: 'BUSINESS_CREATE_ERROR',  message: 'There was an issue with creating the business.' },
    { name: 'ASSOCIATION_ERROR', messsage: 'There was an issue associating the business to the user.'},
    {
      name: 'UNABLE_SIGN_IN',
      message: `
        There was an issue signing in to the newly created business, Please go to the switch business menu in your personal menus
        to sign in to your business.
      `
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO localUserDAO = (DAO) x.get("localUserDAO");
          DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
          User user = ((Subject) x.get("subject")).getUser();
          AgentAuthService agentAuth = (AgentAuthService) x.get("agentAuth");
          // Create user business and associate it to the user.
          InitialBusinessData businessCapabilityData = (InitialBusinessData) ((UserCapabilityJunction) obj).getData();
          Business business = new Business.Builder(x)
            .setBusinessName(businessCapabilityData.getBusinessName())
            .setOrganization(businessCapabilityData.getBusinessName())
            .setAddress(businessCapabilityData.getAddress())
            .setSpid(user.getSpid())
            .build();
          try {
            business = (Business) localUserDAO.inX(x).put(business);
          } catch (Exception e) {
            throw new Error(BUSINESS_CREATE_ERROR);
          }
          UserUserJunction junction = new UserUserJunction.Builder(x)
            .setSourceId(user.getId())
            .setTargetId(business.getId())
            .setGroup(business.getBusinessPermissionId() + "." + "admin")
            .build();
          try {
            agentJunctionDAO.inX(getX()).put(junction);
          } catch (Exception e) {
            throw new Error(ASSOCIATION_ERROR);
          }
          // Uncomment after wizardletconfig on close function is built for the client
          // Currently after the capability has been granted, this will leave the
          // context between the server and client mismatched.
          // try {
          //   agentAuth.actAs(x, business);
          // } catch (Exception e) {
          //   throw new Error(UNABLE_SIGN_IN);
          // }
        }
      }, "Creates business on initial business data submit.");
      `
    }
  ]
});
