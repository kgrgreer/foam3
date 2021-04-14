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
  name: 'FullReverseScenarioAction',
  extends: 'ScenarioAction',

  documentation: `Scenario Action which tries to create a full reverse transaction`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'java.util.Arrays',
    'java.util.ArrayList',
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
      name: 'creditAccount',
      documentation: 'The default credit account to be used in this scenario'
      // add validator make sure not empty
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'feeAccount'
    },
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
      name: 'remediate',
      javaCode: `
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        ticket.setCreditAccount(getCreditAccount());

        agency.submit(x, agencyX -> {
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
        ticket.setAgentInstructions(getTextToAgent() + " The proposed transaction will move "+newRequest.getAmount()+
        " from account "+newRequest.getSourceAccount()+" to Account "+newRequest.getDestinationAccount());
      `
    }
  ]

});
