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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'AddSigningOfficerCapabilityOnPut',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.Capability',
    'net.nanopay.model.BusinessUserJunction',
    'net.nanopay.model.Invitation',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            UserCapabilityJunction old = (UserCapabilityJunction) oldObj;

            DAO capabilityDAO = (DAO) x.get("capabilityDAO");
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
                
            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED ) ) return;

            User business = ((Subject) x.get("subject")).getUser();
            User user = ((Subject) x.get("subject")).getRealUser();
            if ( business == null || user == null ) throw new RuntimeException("business or user cannot be found");

            Capability ucjCapability = (Capability) capabilityDAO.find(ucj.getTargetId());
            Capability soCapability = (Capability) capabilityDAO.find(EQ(Capability.ID, "554af38a-8225-87c8-dfdf-eeb15f71215f-1a5"));
            if ( soCapability == null ) throw new RuntimeException("554af38a-8225-87c8-dfdf-eeb15f71215f-1a5 capability not found");

            SigningOfficerInformationData sodata = (SigningOfficerInformationData) ucj.getData();
            SigningOfficerPersonalData data = sodata.getSoPersonalData();

            data.setBusinessId(business.getId());

            AgentCapabilityJunction agentCapabilityJunction = (AgentCapabilityJunction) userCapabilityJunctionDAO.find(
              AND(
                EQ(AgentCapabilityJunction.SOURCE_ID, user.getId()),
                EQ(AgentCapabilityJunction.TARGET_ID, soCapability.getId()),
                EQ(AgentCapabilityJunction.EFFECTIVE_USER, business.getId())
              )
            );

            if ( agentCapabilityJunction == null ) {
              agentCapabilityJunction = new AgentCapabilityJunction.Builder(x)
                .setSourceId(user.getId())
                .setTargetId(soCapability.getId())
                .setEffectiveUser(business.getId())
                .setData(data)
                .build();

              agentCapabilityJunction = (AgentCapabilityJunction) userCapabilityJunctionDAO.put_(x, agentCapabilityJunction);
            }

            if ( agentCapabilityJunction.getStatus() != CapabilityJunctionStatus.GRANTED ) {
              ((UserCapabilityJunction) obj).setStatus(agentCapabilityJunction.getStatus());
            }

          }
            
        }, "On addSigningOfficerCapability completion, add 'Personal Info for Signing Officer'(...-1a5) capability to agent in context");
      `
    }
  ]
});
