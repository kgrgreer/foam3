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
  name: 'DebtablePlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.Debtable',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.tx.DebtTransaction',
    'net.nanopay.tx.model.Transaction',
    'java.util.List',
    'java.util.ArrayList',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

      // predicate 
      // if ( ! ( sourceAccount instanceof Debtable ) ) return quote;

      Account sourceAccount = quote.getSourceAccount();

      DebtAccount debtAccount = ((Debtable) sourceAccount).findDebtAccount(x);
      if ( debtAccount != null && debtAccount.getLimit() > 0 ) {
        Account creditorAccount = debtAccount.findCreditorAccount(x);
        Transaction d = new DebtTransaction();
        d.copyFrom(requestTxn);
        d.setSourceAccount(creditorAccount.getId());
        d.setDestinationAccount(sourceAccount.getId());

        Long balance = (Long) sourceAccount.findBalance(x);
        Balance bal = new Balance ();
        bal.setBalance(balance);
        bal.setAccount(sourceAccount.getId());
        sourceAccount.validateAmount(x, bal, d.getAmount());
        Long amount = d.getAmount();
        Long debt = amount > balance ? amount - balance : 0L;
        d.setAmount(debt);

        quote.addTransfer(true, creditorAccount.getId(), -d.getAmount(), 0);
        quote.addTransfer(true, sourceAccount.getId(), d.getAmount(), 0);
        quote.addTransfer(true, debtAccount.getId(), -d.getAmount(), 0);
  
        return d;
      }
      return null;
    `
    }
  ]
});
