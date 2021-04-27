/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'CapableCreateInvoiceApprovalsRuleAction',
  extends: 'foam.nanos.crunch.lite.ruler.CapableCreateApprovalsRuleAction',

  documentation: `
    To add a NatureCodeApprovalRequest and TransactionApprovalRequest decorator 
    on ApprovalRequest instantiation for Invoices
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
    'net.nanopay.tx.TransactionApprovalRequest',
    'net.nanopay.invoice.model.Invoice'
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
        { name: 'obj', type: 'FObject' },
        { name: 'capablePayloadObj', type: 'CapabilityJunctionPayload' }
      ],
      javaCode: `
        CapabilityJunctionPayload capablePayload = (CapabilityJunctionPayload) capablePayloadObj;
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Capability capability = (Capability) capabilityDAO.find(capablePayload.getCapability());
        
        // TODO: consider making referenceAware if we need paymentId elsewhere
        Invoice invoice = (Invoice) obj;

        if ( capability instanceof NatureCode ){
          NatureCodeApprovalRequest  natureCodeApprovalRequest = new NatureCodeApprovalRequest.Builder(getX())
            .setDaoKey(request.getDaoKey())
            .setObjId(request.getObjId())
            .setOperation(request.getOperation())
            .setCreatedFor(request.getCreatedFor())
            .setGroup(request.getGroup())
            .setClassification(request.getClassification())
            .setStatus(request.getStatus())
            .setPaymentId(invoice.getPaymentId())
            .setNatureCode(capability.getId()).build();

          return natureCodeApprovalRequest;
        }

        TransactionApprovalRequest  transactionApprovalRequest = new TransactionApprovalRequest.Builder(getX())
          .setDaoKey(request.getDaoKey())
          .setObjId(request.getObjId())
          .setOperation(request.getOperation())
          .setCreatedFor(request.getCreatedFor())
          .setGroup(request.getGroup())
          .setClassification(request.getClassification())
          .setStatus(request.getStatus())
          .setPaymentId(invoice.getPaymentId()).build();

        return transactionApprovalRequest;
      `
    }
  ]
});
