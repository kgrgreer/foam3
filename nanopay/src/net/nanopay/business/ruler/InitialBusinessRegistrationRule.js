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
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'net.nanopay.business.BusinessValidationException',
    'net.nanopay.business.BusinessSignInException',
    'net.nanopay.crunch.onboardingModels.InitialBusinessData',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          DAO localUserDAO = (DAO) x.get("localUserDAO");
          DAO businessDAO = (DAO) x.get("businessDAO");
          User user = ((Subject) x.get("subject")).getUser();

          if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) return;

          InitialBusinessData businessCapabilityData = (InitialBusinessData) ((UserCapabilityJunction) obj).getData();

          //check if business already exist, if it is, update it
          Business updatedBusiness = (Business) businessDAO.find(user.getId());

          if ( updatedBusiness != null ) {
            updatedBusiness.setAddress(businessCapabilityData.getAddress());
            updatedBusiness.setMailingAddress(businessCapabilityData.getMailingAddress());
            updatedBusiness.setPhoneNumber(businessCapabilityData.getCompanyPhone());
            updatedBusiness.setEmail(businessCapabilityData.getEmail());
            updatedBusiness.setSpid(user.getSpid());
            localUserDAO.inX(x).put(updatedBusiness);
            return;
          }

          AgentAuthService agentAuth = (AgentAuthService) x.get("agentAuth");
          // Create user business and associate it to the user.
          Business business = new Business.Builder(x)
            .setBusinessName(businessCapabilityData.getBusinessName())
            .setOrganization(businessCapabilityData.getBusinessName())
            .setAddress(businessCapabilityData.getAddress())
            .setMailingAddress(businessCapabilityData.getMailingAddress())
            .setPhoneNumber(businessCapabilityData.getCompanyPhone())
            .setEmail(businessCapabilityData.getEmail())
            .setSpid(user.getSpid())
            .build();
          try {
            business = (Business) localUserDAO.inX(x).put(business);
            ucj.setSourceId(business.getId());
          } catch (Exception e) {
            ((Logger) x.get("logger")).warning(e);
            throw new BusinessValidationException(e);
          }

          try {
            if (businessCapabilityData.getSignInAsBusiness())
              agentAuth.actAs(x, business);
          } catch (Exception e) {
            ((Logger) x.get("logger")).warning(e);
            throw new BusinessSignInException(e);
          }
        }
      }, "Creates business on initial business data submit.");
      `
    }
  ]
});
