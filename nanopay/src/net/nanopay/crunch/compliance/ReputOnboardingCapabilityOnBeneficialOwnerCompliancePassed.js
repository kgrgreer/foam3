foam.CLASS({
  package: 'net.nanopay.crunch.compliance',
  name: 'ReputOnboardingCapabilityOnBeneficialOwnerCompliancePassed',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Reput the final onboarding capability for compliance checks once the prerequisite
  capability ( businessHasOwners ) compliance has passed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
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

            DAO capabilityCategoryCapabilityDAO = (DAO) x.get("capabilityCategoryCapabilityJunctionDAO");
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

            List<CapabilityCategoryCapabilityJunction> onboardingCapabilitiesJunctions = 
              (List<CapabilityCategoryCapabilityJunction>) ((ArraySink) capabilityCategoryCapabilityDAO
                .where(EQ(CapabilityCategoryCapabilityJunction.SOURCE_ID, "onboarding"))
                .select(new ArraySink()))
                .getArray();

            UserCapabilityJunction onboardingUcj = null;
            for ( CapabilityCategoryCapabilityJunction cccJunction : onboardingCapabilitiesJunctions ) {
              onboardingUcj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(
                AND(
                  EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
                  EQ(UserCapabilityJunction.TARGET_ID, cccJunction.getTargetId()),
                  NEQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
                )
              );
              if ( onboardingUcj != null ) {
                onboardingUcj = (UserCapabilityJunction) userCapabilityJunctionDAO.put(onboardingUcj);
              }
            }
          }
        }, "Reput onboarding UCJ on prerequisite compliance passed");
      `
    }
  ]
});
