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
  name: 'DebtRepaymentPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
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
      //predicate 
      // if ( ! ( quote.getDestinationAccount() instanceof DebtAccount ) )
      //   return super.put_(x, quote);

      
      Transaction txn = new DebtTransaction.Builder(x).build();
      txn.copyFrom(requestTxn);

      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      Account creditorAccount = ((DebtAccount) destinationAccount).findCreditorAccount(x);

      Long balance = (Long) destinationAccount.findBalance(x);
      Balance bal = new Balance ();
      bal.setBalance(balance);
      bal.setAccount(destinationAccount.getId());

      Long amount = txn.getAmount();
      amount = amount > -balance ? -balance : amount;
      destinationAccount.validateAmount(x, bal, amount);
      txn.setAmount(amount);

      quote.addTransfer(true, sourceAccount.getId(), -txn.getAmount(), 0);
      quote.addTransfer(true, destinationAccount.getId(), txn.getAmount(), 0);
      quote.addTransfer(true, creditorAccount.getId(), txn.getAmount(), 0);

      return txn;
    `
    }
  ]
});
