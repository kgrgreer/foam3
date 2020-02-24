foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionQuoteCorridorPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if payment Provider Can Handle Corridor in transaction quote',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.payment.PaymentCorridorService',

    'static foam.mlang.MLang.*',
  ],
  properties: [
    {
      class: 'Long',
      name: 'providerId'
    },
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
      FObject nu  = (FObject) NEW_OBJ.f(obj);
      if ( ! ( nu instanceof TransactionQuote ) ) return false;
      TransactionQuote tq = (TransactionQuote) nu;

      if ( ! (tq.getSourceAccount() instanceof BankAccount) 
        || ! (tq.getDestinationAccount() instanceof BankAccount) ) return false;
      BankAccount from = (BankAccount) tq.getSourceAccount();
      BankAccount to = (BankAccount) tq.getDestinationAccount();

      return new PaymentCorridorService().canProcessCurrencyPair(((X) obj), getProviderId(), 
        from.getCountry(), to.getCountry(), from.getDenomination(), to.getDenomination());
      
      `
    }
  ]
});