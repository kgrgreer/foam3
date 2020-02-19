/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.planner.predicate',
  name: 'CACICOPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.payment.PaymentProvider',
    'java.util.ArrayList',
    'static foam.mlang.MLang.NEW_OBJ'
  ],

  properties: [
    {
      class: 'String',
      name: 'providerId'
    },
    {
      class: 'Boolean',
      name: 'isCI'
    }
  ],

methods: [
  {
    name: 'f',
    javaCode: `
      TransactionQuote quote = (TransactionQuote) NEW_OBJ.f(obj);
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( getIsCI() ) {
        if ( ! (sourceAccount instanceof CABankAccount &&
          destinationAccount instanceof DigitalAccount && 
          sourceAccount.getOwner() == destinationAccount.getOwner()) ) {
          return false;
        }
        if ( ! usePaymentProvider(getX(), (BankAccount) sourceAccount, false) ) {
          return false;
        } 
        if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
          return false;
        }
        return true;
      }

      if ( ! (sourceAccount instanceof DigitalAccount &&
        destinationAccount instanceof CABankAccount && 
        sourceAccount.getOwner() == destinationAccount.getOwner()) ) {
        return false;
      }
      if ( ! usePaymentProvider(getX(), (BankAccount) destinationAccount, false) ) {
        return false;
      } 
      if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) {
        return false;
      }
      return true;
    `
  },
  {
    name: 'usePaymentProvider',
    type: 'Boolean',
    args: [
      {
        name: 'x',
        type: 'foam.core.X'
      },
      {
        name: 'bankAccount',
        type: 'net.nanopay.bank.BankAccount'
      },
      {
        name: 'isDefault',
        type: 'Boolean'
      }
    ],
    javaCode: `
      ArrayList<PaymentProvider> paymentProviders = PaymentProvider.findPaymentProvider(x, bankAccount);
      if ( paymentProviders.size() == 0 &&
          isDefault) {
        return true;
      }
      return paymentProviders.stream().filter( (paymentProvider)-> paymentProvider.getName().equals(getProviderId()) ).count() > 0;
    `
  }
]
});
