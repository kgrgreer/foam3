/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'CapabilityIsStatus',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*',
  ],

  properties: [
    {
      name: 'capabilityId',
      class: 'String'
    },
    {
      name: 'subjectFromUCJ',
      class: 'Boolean',
      value: true,
      documentation: `
        When this property is true, CapabilityIsStatus expects a UCJ object in
        the context which it will use to determine the corresponding subject.
        Otherwise, the context is assumed to contain the appropriate subject.
      `
    },
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      documentation: `Check status of the capabilities user capability junction status.`,
      javaFactory: `
        return foam.nanos.crunch.CapabilityJunctionStatus.GRANTED;
      `
    },
    {
      class: 'Boolean',
      name: 'includeRenewable',
      documentation: `
        When status is set to GRANTED and ucjs are granted and renewable, CapabilityIsStatus predicate
        will return true if this property is set to true or return false otherwise.
      `
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        var x = (X) obj;

        if ( getSubjectFromUCJ() ) {
          var newUCJ = (UserCapabilityJunction) x.get("NEW");
          if ( newUCJ != null ) {
            x = x.put("subject", newUCJ.getSubject(x));
          }
        }

        // Context requirements
        var crunchService = (CrunchService) x.get("crunchService");
        var capabilityDAO = (DAO) x.get("capabilityDAO");

        // Verify that the capability exists
        Capability cap = (Capability) capabilityDAO.inX(x).find(getCapabilityId());
        if ( cap == null || cap.getLifecycleState() != foam.nanos.auth.LifecycleState.ACTIVE ) return false;

        var ucj = crunchService.getJunction(x, getCapabilityId());
        if ( ucj == null || ucj.getStatus() != getStatus() ) return false;
        // if status being checked is GRANTED, check if we should include ucjs that are renewable
        if ( getStatus() == GRANTED && crunchService.isRenewable(x, ucj.getTargetId()) ) return getIncludeRenewable();
        return true;
      `
    }
  ]
});
