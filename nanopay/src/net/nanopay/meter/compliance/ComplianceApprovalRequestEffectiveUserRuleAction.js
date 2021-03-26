/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceApprovalRequestEffectiveUserRuleAction',

  documentation: `
    To add effectiveUser to compliance approval requests
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ComplianceApprovalRequest carObj = (ComplianceApprovalRequest) obj;

        DAO dao = (DAO) x.get(carObj.getDaoKey());

        UserCapabilityJunction ucj = (UserCapabilityJunction) dao.find(carObj.getObjId());

        Long effectiveUser = ucj.getSourceId();

        if ( ucj instanceof AgentCapabilityJunction ){
          AgentCapabilityJunction acj = (AgentCapabilityJunction) ucj;
          effectiveUser = acj.getEffectiveUser();
        }

        carObj.setEffectiveUser(effectiveUser);
      `
    }
  ]
});
