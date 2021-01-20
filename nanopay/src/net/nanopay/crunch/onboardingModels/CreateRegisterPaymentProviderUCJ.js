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
  name: 'CreateRegisterPaymentProviderUCJ',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Create a UserCapabilityJunction between User and Register Payment provider capability when appropriate onboarding cap becomes pending.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
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
            CrunchService crunchService = (CrunchService) x.get("crunchService");
            String[] dependentIds = crunchService.getDependentIds(x, ucj.getTargetId());
            String dependentId = null;

            for ( String id : dependentIds ) {
              if ( isOfCategory(x, id, "toplevelonboarding") ) {
                dependentId = id;
                break;
              }
            }

            if ( dependentId == null ) return;
            List<String> prereqs = crunchService.getPrereqs(dependentId);
            for ( String id : prereqs ) {
              if ( isOfCategory(x, id, "registerPaymentProvider") ) {
                // Work around for case when caps are created  as GRANTED when they have no prereqs
                List<String> providers = crunchService.getPrereqs(id);
                for ( String provider : providers ) {
                  crunchService.updateUserJunction(x, ucj.getSubject(x), provider, null, CapabilityJunctionStatus.AVAILABLE);
                }
                crunchService.updateUserJunction(x, ucj.getSubject(x), id, null, CapabilityJunctionStatus.PENDING);
                break;
              }
            }
          }
        }, "Create a UserCapabilityJunction between User and Register Payment provider capability when appropriate onboarding cap becomes pending.");
      `
    },
    {
      name: 'isOfCategory',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'capabilityId',
          type: 'String'
        },
        {
          name: 'category',
          type: 'String'
        }
      ],
      javaCode: `
        DAO categoryJunctionDAO = (DAO) x.get("capabilityCategoryCapabilityJunctionDAO");
        CapabilityCategoryCapabilityJunction junction = (CapabilityCategoryCapabilityJunction) categoryJunctionDAO.find(
          AND(
            EQ(CapabilityCategoryCapabilityJunction.SOURCE_ID, category),
            EQ(CapabilityCategoryCapabilityJunction.TARGET_ID, capabilityId)
          )
        );
        return junction != null;
      `
    },
  ]
});
