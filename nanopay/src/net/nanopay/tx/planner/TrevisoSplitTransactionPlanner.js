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
  name: 'TrevisoSplitTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Split BRL to other currency',

  javaImports: [
    'foam.core.Unit',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.kotak.KotakCredentials',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.bmo.cico.BmoCITransaction',
    'net.nanopay.tx.KotakAccountRelationshipLineItem',
    'net.nanopay.tx.KotakCOTransaction',
    'net.nanopay.tx.KotakPaymentPurposeLineItem',
    'net.nanopay.tx.rbc.RbcCITransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.List',
    'org.apache.commons.lang.ArrayUtils'
  ],

  constants: [
    {
      type: 'Long',
      name: 'AFEX_BANK_ACCOUNT',
      value: 24
    }
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

      DAO dao = (DAO) x.get("localTransactionPlannerDAO");
      TransactionQuote q1 = new TransactionQuote();
      
      // plan USD to dest currency via afex
      Transaction t1 = (Transaction) requestTxn.fclone();
      t1.clearLineItems();
      t1.setSourceCurrency("USD");
      t1.setAmount(0);
      q1.setRequestTransaction(t1);
      q1.setCorridorsEnabled(false);
      Transaction afexPlan = ((TransactionQuote) dao.put(q1)).getPlan();
      if ( afexPlan == null ) {
        return null;
      }

      // plan BRL to USD via trevisoPlanner, set usd amount to required amount by afex transaction
      Transaction t2 = (Transaction) requestTxn.fclone();
      t2.setDestinationAccount(this.AFEX_BANK_ACCOUNT);
      t2.setDestinationCurrency("USD");
      t2.setDestinationAmount(afexPlan.getAmount());
      Transaction trevisoPlan = quoteTxn(x, t2, false);

      FXSummaryTransaction txn = new FXSummaryTransaction();
      requestTxn = (Transaction) requestTxn.fclone();
      requestTxn.setAmount(trevisoPlan.getAmount());
      txn.copyFrom(requestTxn);
      txn.clearLineItems();
      txn.addNext(createCompliance(requestTxn));
      
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.addNext(trevisoPlan.getNext()[0]);
      txn.addNext(afexPlan.getNext()[0].getNext()[0]); 
      return txn;
    `
    }
  ]
});
