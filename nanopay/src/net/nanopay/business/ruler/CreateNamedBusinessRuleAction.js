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
  name: 'CreateNamedBusinessRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Creates business when business detail data is submitted.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AgentAuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'net.nanopay.crunch.registration.BusinessNameAware',
    'net.nanopay.model.Business'
  ],

  messages: [
    { name: 'BUSINESS_CREATE_ERROR',  message: 'Error creating business.' },
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
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          User user = ((Subject) x.get("subject")).getUser();

          if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) return;

          BusinessNameAware businessNameData = (BusinessNameAware) ((UserCapabilityJunction) obj).getData();

          // Create business with minimal information
          Business business = new Business.Builder(x)
            .setBusinessName(businessNameData.getBusinessName())
            .setOrganization(businessNameData.getBusinessName())
            .setSpid(user.getSpid())
            .build();
          
          try {
            DAO localUserDAO = (DAO) x.get("localUserDAO");
            business = (Business) localUserDAO.inX(x).put(business);
            ucj.setSourceId(business.getId());
          } catch (Exception e) {
            ((Logger) x.get("logger")).warning(e);
            throw new Error(BUSINESS_CREATE_ERROR);
          }

          try {
            AgentAuthService agentAuth = (AgentAuthService) x.get("agentAuth");
            agentAuth.actAs(x, business);
          } catch (Exception e) {
            ((Logger) x.get("logger")).warning(e);
            throw new Error(UNABLE_SIGN_IN);
          }
        }
      }, "Creates business on business detail data submit.");
      `
    }
  ]
});
