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
  package: 'net.nanopay.ticket',
  name: 'BasicFullReverseRefundTicketCreateRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to determine if the transaction can be refunded`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'java.util.Arrays',
    'java.util.ArrayList',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.SummarizingTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.SummaryTransactionLineItem',
    'net.nanopay.tx.billing.ErrorFee',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'  
  ],

  properties: [
    {
      class: 'String',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'textToAgent',
      documentation: 'Description of the base resolution path'
    },
    {
      class: 'String',
      name: 'creditAccount',
      documentation: 'The default credit account to be used in this scenario'
      // add validator make sure not empty
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'feeAccount'
    },
    {
      class: 'String',
      name: 'postApprovalRuleId',
      visibility: 'HIDDEN',
      networkTransient: true
    }
  ],

  methods: [
    {
      name: 'findFeeLineItems',
      args: [
        {
          name: 'lineItems',
          type: 'List<TransactionLineItem>'
        }
      ],
      javaType: 'List<FeeLineItem>',
      javaCode: `
        List<FeeLineItem> feeLineItemsAvaliable = new ArrayList<>();

        for ( TransactionLineItem lineItem : lineItems ){
          if ( lineItem instanceof FeeLineItem ){
            feeLineItemsAvaliable.add((FeeLineItem) lineItem);
          }

          if ( lineItem instanceof SummaryTransactionLineItem ){
            SummaryTransactionLineItem summaryTransactionLineItem = (SummaryTransactionLineItem) lineItem;
            feeLineItemsAvaliable.addAll(findFeeLineItems(Arrays.asList(summaryTransactionLineItem.getLineItems())));
          }
        }

        return feeLineItemsAvaliable;
      `
    },
    {
      name: 'applyAction',
      javaCode: `
        RefundTicket ticket = (RefundTicket) obj;
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        ticket.setCreditAccount(getCreditAccount());
        final Transaction summary;
        Transaction temp = (Transaction) txnDAO.find(ticket.getProblemTransaction());
        if (! (temp instanceof SummarizingTransaction ) ) {
          summary = temp.findRoot(x);
        } else {
          summary = temp;
        }
        Transaction problem = summary.getStateTxn(x);

        agency.submit(x, agencyX -> {
          Transaction problemClone = (Transaction) problem.fclone();
          ticket.setProblemTransaction(problem.getId());
          ticket.setRefundTransaction(summary.getId());
          DAO txnDAO2 = (DAO) agencyX.get("localTransactionDAO");
          try {
            problemClone.setStatus(TransactionStatus.PAUSED);
            txnDAO2.put(problemClone);
          }
          catch ( Exception e ) {
            try {
              List children = ((ArraySink) problem.getChildren(x).select(new ArraySink())).getArray();
              for ( Object t : children) {
                t = (Transaction) ((Transaction) t).fclone(); 
                ((Transaction) t).setStatus(TransactionStatus.PAUSED);
                txnDAO2.put((Transaction) t);
              }
            }
            catch ( Exception e2 ) {
              Logger logger = (Logger) x.get("logger");
              logger.error("we failed to pause the Transaction "+problem.getId());
            }
          }
        }, "Reput transaction as paused");

        Transaction newRequest = new Transaction();
        newRequest.setAmount(problem.getAmount());
        newRequest.setDestinationAccount(summary.getSourceAccount());
        newRequest.setSourceAccount(problem.getSourceAccount());
        newRequest.setSourceCurrency(problem.getSourceCurrency());
        newRequest.setDestinationCurrency(summary.getSourceCurrency());

        if ( ! SafetyUtil.isEmpty(getErrorCode()) ) {
          DAO errorFeeDAO = (DAO) x.get("localErrorFeeDAO");
          ErrorFee error = (ErrorFee) errorFeeDAO.find(getErrorCode());
          if ( error != null ) {
            FeeLineItem fee = new FeeLineItem();
            fee.setAmount(error.getAmount());
            fee.setFeeCurrency(error.getCurrency());
            fee.setDestinationAccount(getFeeAccount());
            fee.setSourceAccount(newRequest.getSourceAccount());
            newRequest.addLineItems(new TransactionLineItem[]{fee});
          }
        }

        List<FeeLineItem> feeLineItemsAvaliable = findFeeLineItems(Arrays.asList(summary.getLineItems()));
        
        ticket.setFeeLineItemsAvaliable(feeLineItemsAvaliable.toArray(FeeLineItem[]::new));
        ticket.setRequestTransaction(newRequest);
        ticket.setPostApprovalRuleId(getPostApprovalRuleId());
        ticket.setAgentInstructions(getTextToAgent() + " The proposed transaction will move "+newRequest.getAmount()+
        " from account "+newRequest.getSourceAccount()+" to Account "+newRequest.getDestinationAccount());


        // send back to agent for fee/credit entering and approval.
        // scenario has crafted the request transaction.
        // agent presses. approve. then we hit refundRUle.
        // refund rule does a plan with the specified request transaction to the txn Dao for immidiete execution.
        // transaction is put.. this updates the ticket.
      `
    }
  ]

});
