
foam.CLASS({
  package: 'net.nanopay.crunch.compliance',
  name: 'IsPendingCapabilityOfCertainCategory',
  
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  
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

  properties: [
    {
      name: 'category',
      class: 'String'
    },
    { 
      name: 'isRecurring',
      class: 'Boolean',
      value: true
    },
    {
      name: 'statusChanged',
      class: 'Boolean', 
      value: true,
      documentation: `
        Denote if a status change is required.
        If this is true, the old ucj must not be in status PENDING
      `
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");

        if ( ( getStatusChanged() && old != null && old.getStatus() == CapabilityJunctionStatus.PENDING ) || 
             ( old != null && old.getStatus() == CapabilityJunctionStatus.EXPIRED && ! getIsRecurring() ) || 
              ucj.getStatus() != CapabilityJunctionStatus.PENDING ) 
          return false;

        DAO categoryJunctionDAO = (DAO) x.get("capabilityCategoryCapabilityJunctionDAO");

        CapabilityCategoryCapabilityJunction junction = (CapabilityCategoryCapabilityJunction) categoryJunctionDAO.find(
          AND(
            EQ(CapabilityCategoryCapabilityJunction.SOURCE_ID, getCategory()),
            EQ(CapabilityCategoryCapabilityJunction.TARGET_ID, ucj.getTargetId())
          )
        );
        
        return junction != null;
      `
    }
  ]
});
  
  