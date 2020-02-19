foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'CanHandleCorridorPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if payment Provider Can Handle Corridor',

  javaImports: [
    'foam.core.X',
    'net.nanopay.tx.model.Transaction',
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
      Transaction tx = (Transaction) NEW_OBJ.f(obj);
      BankAccount from = (BankAccount) tx.findSourceAccount((X) obj);
      BankAccount to = (BankAccount) tx.findDestinationAccount((X) obj);

      return new PaymentCorridorService().canProcessCurrencyPair(((X) obj), getProviderId(), 
        from.getCountry(), to.getCountry(), from.getDenomination(), to.getDenomination());
      
      `
    }
  ]
});