foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SetBusinessOnboardedOnUCJPut',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],
  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.admin.model.ComplianceStatus',
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
            UserCapabilityJunction old = (UserCapabilityJunction) oldObj;
            DAO businessDAO = (DAO) x.get("businessDAO");

            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || 
                 ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED ) ) 
              return;
            
            Long businessId = ucj.getSourceId();
            Business business = (Business) businessDAO.inX(x).find(businessId);
            if ( business == null ) throw new RuntimeException("Error setting business status: Business not found");

            business.setOnboarded(true);
            business.setCompliance(ComplianceStatus.REQUESTED);
            businessDAO.put_(x, business);
          }
        }, "On onboarding ucj granted, set business onboarded to true and compliance to requested");
      `
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'OnboardingCapabilityUCJSubmitted',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],
  documentation: `Returns true if the capability of the ucj submitted is one of the onboarding capabilities`,
  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityCategory',
    'foam.nanos.crunch.CapabilityCategoryCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        X x = getX();

        UserCapabilityJunction ucj = null;
        try {
          ucj = (UserCapabilityJunction) obj;
        } catch( ClassCastException e ) {
          if ( obj instanceof X ) {
            x = (X) obj;
            Object ucjObj = (Object) x.get("NEW");
            if ( ucjObj != null && ucjObj instanceof UserCapabilityJunction ) 
              ucj = (UserCapabilityJunction) ucjObj;
          } else {
            throw e;
          }
        }

        if ( ucj == null || ucj.getStatus() != CapabilityJunctionStatus.GRANTED ) return false;

        DAO categoryJunctionDAO = (DAO) x.get("capabilityCategoryCapabilityJunctionDAO");

        CapabilityCategoryCapabilityJunction junction = (CapabilityCategoryCapabilityJunction) categoryJunctionDAO.find(
          AND(
            EQ(CapabilityCategoryCapabilityJunction.SOURCE_ID, "onboarding"),
            EQ(CapabilityCategoryCapabilityJunction.TARGET_ID, ucj.getTargetId())
          )
        );
        
        return junction != null;
      `
    }
  ]
});
  
  