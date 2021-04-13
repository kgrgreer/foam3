/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'ApprovedNatureCodeApprovalRequestRuleAction',

  documentation: `
    To add NatureCodeData to the payment transaction (stored in Invoice.paymentId) NatureCodeLineItem
    and to the related approvable for the capablePayload of the NatureCode which gets processed
    to the Capable object in CapablePayloadApprovableRuleAction
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.crunch.lite.Capable',
    'net.nanopay.country.br.NatureCode',
    'net.nanopay.country.br.NatureCodeData',
    'net.nanopay.country.br.NatureCodeApprovalRequest',
    'net.nanopay.country.br.tx.NatureCodeLineItem',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionLineItem',
    'foam.nanos.auth.Subject',
    'java.util.Map',
    'java.util.HashMap',
    'foam.util.SafetyUtil',
    'foam.nanos.logger.Logger'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        Logger logger = (Logger) x.get("logger");

        NatureCodeApprovalRequest ncarObj = (NatureCodeApprovalRequest) obj;

        agency.submit(x, new ContextAwareAgent() {

          @Override
          public void execute(X x) {
            DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
            DAO approvableDAO = (DAO) getX().get("approvableDAO");
            DAO natureCodeDataDAO = (DAO) getX().get("natureCodeDataDAO");
            DAO natureCodeDAO = (DAO) getX().get("natureCodeDAO");
            DAO transactionDAO = (DAO) getX().get("transactionDAO");

            Approvable approvable = (Approvable) approvableDAO.find(ncarObj.getObjId());
            NatureCode natureCode = (NatureCode) natureCodeDAO.find(ncarObj.getNatureCode());
            NatureCodeData natureCodeDataToAdd = (NatureCodeData) natureCodeDataDAO.find(ncarObj.getNatureCodeData());
            Map propertiesToUpdate = (HashMap) approvable.getPropertiesToUpdate();

            propertiesToUpdate.put("data", natureCodeDataToAdd);

            approvableDAO.put(approvable);

            DAO dao = (DAO) getX().get(approvable.getServerDaoKey());

            FObject requestObject = dao.find(approvable.getObjId());

            Capable capableRequestObject = (Capable) requestObject;

            if ( ! (requestObject instanceof Invoice) ){
              throw new RuntimeException("ObjectToReput is not of type Invoice");
            }

            Invoice invoiceRequestObject = (Invoice) requestObject;

            Transaction paymentTransaction = (Transaction) transactionDAO.find(invoiceRequestObject.getPaymentId());

            for (TransactionLineItem lineItem : paymentTransaction.getLineItems() ) {
              if ( lineItem instanceof NatureCodeLineItem ) {
                NatureCodeLineItem natureCodeLineItem = (NatureCodeLineItem) lineItem;

                if ( SafetyUtil.isEmpty(natureCodeLineItem.getNatureCode()) ) {
                  natureCodeLineItem.setNatureCode(natureCode.getOperationType());
                }

                 natureCodeLineItem.setNatureCodeData(natureCodeDataToAdd);
                break;
              }
            }
            transactionDAO.put(paymentTransaction);

            Transaction compliance = (Transaction) ((ArraySink) (paymentTransaction.getChildren(x).select(new ArraySink()))).getArray().get(0);
            Transaction exchange = (Transaction) ((ArraySink) (compliance.getChildren(x).select(new ArraySink()))).getArray().get(0);
            Transaction treviso = (Transaction) ((ArraySink) (exchange.getChildren(x).select(new ArraySink()))).getArray().get(0);

            for (TransactionLineItem lineItem : treviso.getLineItems() ) {
              if ( lineItem instanceof NatureCodeLineItem ) {
                NatureCodeLineItem natureCodeLineItem = (NatureCodeLineItem) lineItem;

                if ( SafetyUtil.isEmpty(natureCodeLineItem.getNatureCode()) ) {
                  natureCodeLineItem.setNatureCode(natureCode.getOperationType());
                }

                natureCodeLineItem.setNatureCodeData(natureCodeDataToAdd);
                break;
              }
            }
            transactionDAO.put(treviso);
          }

        }, "Added NatureCodeData to Payment Transaction line item and capable payload after an approved NatureCodeApprovalRequest");
      `
    }
  ]
});
