/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  extends: 'net.nanopay.ticket.ScenarioAction',

  documentation: `Scenario Action which tries to create a full reverse transaction`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.Arrays',
    'java.util.ArrayList',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.SummarizingTransaction',
    'net.nanopay.tx.SummaryTransactionLineItem',
    'net.nanopay.tx.TransactionLineItem',
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
          name: 'x',
          type: 'Context'
        },
        {
          name: 'summary',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaType: 'List<FeeLineItem>',
      javaCode: `
        List<FeeLineItem> feeLineItemsAvaliable = new ArrayList<>();

        if ( summary.getStatus() != TransactionStatus.COMPLETED ) {
          return feeLineItemsAvaliable;
        }

        DAO dao = (DAO) x.get("localTransactionDAO");
        List children = ((ArraySink) dao.where(EQ(Transaction.PARENT, summary.getId())).select(new ArraySink())).getArray();
        for ( Object obj : children ) {
          Transaction child = (Transaction) obj;
          List<FeeLineItem> lineItems = findFeeLineItems(x, child);
          for ( TransactionLineItem lineItem : lineItems ){
            feeLineItemsAvaliable.add((FeeLineItem) lineItem);
          }
        }

        if ( summary instanceof SummarizingTransaction ) {
          return feeLineItemsAvaliable;
        }

        for ( TransactionLineItem lineItem : summary.getLineItems() ){
          if ( lineItem instanceof FeeLineItem ){
            feeLineItemsAvaliable.add((FeeLineItem) lineItem);
          }
        }

        return feeLineItemsAvaliable;
      `
    },
    {
      name: 'remediate',
      javaCode: `
        ticket.setCreditAccount(getCreditAccount());

        Transaction newRequest = new Transaction();
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        Transaction problem = (Transaction) txnDAO.find(ticket.getProblemTransaction());
        Transaction summary = (Transaction) txnDAO.find(ticket.getRefundTransaction());

        newRequest.setAmount(problem.getAmount());
        newRequest.setDestinationAccount(summary.getSourceAccount());
        newRequest.setSourceAccount(problem.getSourceAccount());
        newRequest.setSourceCurrency(problem.getSourceCurrency());
        newRequest.setDestinationCurrency(summary.getSourceCurrency());

        List<FeeLineItem> feeLineItemsAvaliable = findFeeLineItems(x, summary);
        ticket.setFeeLineItemsAvaliable(feeLineItemsAvaliable.toArray(FeeLineItem[]::new));

        ticket.setRequestTransaction(newRequest);
      `
    }
  ]

});
