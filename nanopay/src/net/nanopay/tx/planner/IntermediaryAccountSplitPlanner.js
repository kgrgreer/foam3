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
  package: 'net.nanopay.tx.planner',
  name: 'IntermediaryAccountSplitPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Split src currency to dest currency via intermediary currency',

  javaImports: [
    'foam.core.Unit',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  constants: [

  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    },
    {
      class: 'Long',
      name: 'intermediaryAccountId'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

      DAO dao = (DAO) x.get("localTransactionPlannerDAO");
      DAO accountDAO = (DAO) x.get("localAccountDAO");
      TransactionQuote q1 = new TransactionQuote();

      Account intermediaryAccount = (Account) accountDAO.find(this.getIntermediaryAccountId());
      
      // plan intermediary to dest currency (leg2)
      Transaction t1 = (Transaction) requestTxn.fclone();
      t1.clearLineItems();
      t1.setSourceCurrency(intermediaryAccount.getDenomination());
      t1.setAmount(0);
      q1.setRequestTransaction(t1);
      q1.setCorridorsEnabled(false);
      Transaction leg2 = ((TransactionQuote) dao.put(q1)).getPlan();
      if ( leg2 == null ) {
        return null;
      }

      // plan src to intermediary currency (leg1)
      Transaction t2 = (Transaction) requestTxn.fclone();
      t2.setDestinationAccount(intermediaryAccount.getId());
      t2.setDestinationCurrency(intermediaryAccount.getDenomination());
      t2.setDestinationAmount(leg2.getAmount());
      Transaction leg1 = quoteTxn(x, t2, false);

      FXSummaryTransaction txn = new FXSummaryTransaction();
      requestTxn = (Transaction) requestTxn.fclone();
      requestTxn.setAmount(leg1.getAmount());
      txn.copyFrom(requestTxn);
      txn.clearLineItems();
      txn.addNext(createCompliance(requestTxn));
      
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.addNext(leg1.getNext()[0].getNext()[0]);
      txn.addNext(leg2.getNext()[0].getNext()[0]); 
      return txn;
    `
    }
  ]
});
