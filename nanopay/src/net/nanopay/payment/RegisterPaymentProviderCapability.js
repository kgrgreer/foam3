/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'RegisterPaymentProviderCapability',
  extends: 'foam.nanos.crunch.MinMaxCapability',

  documentation: 'This capability should always be in Pending status if the minimum required prerequisite  is not yet fufilled',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.Subject'
  ],

  methods: [
    {
      name: 'getPrereqsChainedStatus',
      type: 'CapabilityJunctionStatus',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ucj', type: 'UserCapabilityJunction' }
      ],
      javaCode: `
        // Required services and DAOs
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Subject junctionSubject = (Subject) ucj.getSubject(x);

        // Prepare to count statuses
        int numberGranted = 0;

        // Get list of prerequisite capability ids
        List<String> prereqCapabilityIds = crunchService.getPrereqs(x, getId(), ucj);

        // this is under the assumption that minmaxCapabilities should always have prerequisites
        // and that min is never less than 1
        if ( prereqCapabilityIds == null || prereqCapabilityIds.size() == 0 ) return CapabilityJunctionStatus.ACTION_REQUIRED;

        // Count junction statuses
        for ( String capId : prereqCapabilityIds ) {
          Capability cap = (Capability) capabilityDAO.find(capId);
          if ( ! cap.getEnabled() ) continue;

          X junctionSubjectContext = x.put("subject", junctionSubject);
          UserCapabilityJunction ucJunction =
            crunchService.getJunction(junctionSubjectContext, capId);
          if ( ucJunction.getStatus() == CapabilityJunctionStatus.AVAILABLE ) continue;

          switch ( ucJunction.getStatus() ) {
            case GRANTED:
              numberGranted++;
              break;
          }
        }

        if ( numberGranted >= getMin() ) {
          return CapabilityJunctionStatus.GRANTED;
        }

        return CapabilityJunctionStatus.PENDING;
      `
    }
  ]
});
