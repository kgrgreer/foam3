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
  package: 'net.nanopay.tx.planner',
  name: 'BankDigitalCompositeFeePlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Plans Fee transations to multiple destinations with a singular cashin.
  This planner only works when all fee accounts are on the same trust account and in the same currency
  `,

  javaImports: [
    'net.nanopay.tx.FeeSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.IndependentTransactionFeeLineItem',
    'net.nanopay.tx.CompositeTransaction',
    'java.util.ArrayList',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount'
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

        FeeSummaryTransaction summary = new FeeSummaryTransaction();
        summary.copyFrom(requestTxn);

        CompositeTransaction comp = createCompositeTransaction(requestTxn);

        BankAccount source = (BankAccount) requestTxn.findSourceAccount(x);
        ArrayList<Transaction> feeTransactions = new ArrayList<Transaction>();

        // create all the digital fee transactions
        for ( TransactionLineItem tli : requestTxn.getLineItems() ) {
          if ( tli instanceof IndependentTransactionFeeLineItem ) {
            IndependentTransactionFeeLineItem itli = ((IndependentTransactionFeeLineItem) tli);
            Transaction leg2 = new Transaction();
            leg2.setDestinationAccount(itli.getDestinationAccount());
            leg2.setSourceAccount(requestTxn.getDestinationAccount());
            leg2.setAmount(itli.getAmount());
            leg2.setDestinationAmount(itli.getAmount());
            leg2.setSourceCurrency(requestTxn.getSourceCurrency());
            leg2.setDestinationCurrency(requestTxn.getDestinationCurrency());
            leg2 = this.quoteTxn(x, leg2, null, true);
            leg2 = this.removeSummaryTransaction(leg2);
            feeTransactions.add(leg2);
          }
        }

        Transaction cashin = new Transaction();
        cashin.setSourceAccount(requestTxn.getSourceAccount());
        cashin.setDestinationAccount(requestTxn.getDestinationAccount());
        cashin.setAmount(requestTxn.getAmount());
        cashin.setSourceCurrency(requestTxn.getSourceCurrency());
        cashin.setDestinationCurrency(requestTxn.getDestinationCurrency());
        cashin = this.quoteTxn(x, cashin, null, true);
        cashin = this.removeSummaryTransaction(cashin);

        summary.addNext(cashin);
        summary.addNext(comp);
        for ( Transaction t : feeTransactions ) {
          summary.addNext(t);
        }
        return summary;
      `
    }
  ]
});
