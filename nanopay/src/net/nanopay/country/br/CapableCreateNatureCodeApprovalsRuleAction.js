/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'CapableCreateNatureCodeApprovalsRuleAction',
  extends: 'foam.nanos.crunch.lite.ruler.CapableCreateApprovalsRuleAction',

  documentation: `
    To add a NatureCodeApprovalRequest decorator on ApprovalRequest instantiation in
    CapableCreateApprovalsRuleAction
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalStatus',
    'foam.comics.v2.userfeedback.UserFeedback',
    'foam.comics.v2.userfeedback.UserFeedbackException',
    'foam.comics.v2.userfeedback.UserFeedbackStatus',
    'foam.nanos.dao.Operation',
    'foam.nanos.auth.Subject',
    'java.util.Map',
    'java.util.ArrayList',
    'java.util.List',
    'foam.util.SafetyUtil',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.logger.Logger',
    'net.nanopay.country.br.NatureCode',
    'net.nanopay.country.br.NatureCodeApprovalRequest',
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'decorateApprovalRequest',
      documentation: `
        For further tweaks needed to be done to the approval request, the default is to not add anything
      `,
      type: 'ApprovalRequest',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'ApprovalRequest' },
        { name: 'capableObj', type: 'Capable' },
        { name: 'capablePayloadObj', type: 'CapabilityJunctionPayload' }
      ],
      javaCode: `
        CapabilityJunctionPayload capablePayload = (CapabilityJunctionPayload) capablePayloadObj;
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Capability capability = (Capability) capabilityDAO.find(capablePayload.getCapability());

        if ( ! ( capability instanceof NatureCode ) ){
          return request;
        }

        NatureCodeApprovalRequest  natureCodeApprovalRequest = new NatureCodeApprovalRequest.Builder(getX())
          .setDaoKey(request.getDaoKey())
          .setObjId(request.getObjId())
          .setOperation(request.getOperation())
          .setCreatedFor(request.getCreatedFor())
          .setGroup(request.getGroup())
          .setClassificationEnum(ApprovalRequestClassificationEnum.forLabel(request.getClassification()))
          .setStatus(request.getStatus())
          .setNatureCode(capability.getId()).build();

        return natureCodeApprovalRequest;
      `
    }
  ]
});
