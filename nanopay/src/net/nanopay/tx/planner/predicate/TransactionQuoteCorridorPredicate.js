foam.CLASS({
  package: 'net.nanopay.tx.planner.predicate',
  name: 'TransactionQuoteCorridorPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if payment Provider Can Handle Corridor in transaction quote',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
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
      Account from = tq.getSourceAccount();
      Account to = tq.getDestinationAccount();

      if ( from == null || to == null ) return false;

      String sourceCountry  = "";
      String targetCountry  = "";
      String sourceCurrency = from.getDenomination();
      String targetCurrency = to.getDenomination();

      if ( from instanceof BankAccount ) {
        sourceCountry = ((BankAccount) from).getCountry();
      } else {
        sourceCountry = ((BankAccount) TrustAccount.find(((X) obj),from)
          .findReserveAccount(((X) obj))).getCountry();
      }

      if ( to instanceof BankAccount ) {
        targetCountry = ((BankAccount) to).getCountry();
      } else {
        targetCountry = ((BankAccount) TrustAccount.find(((X) obj),to)
          .findReserveAccount(((X) obj))).getCountry();
      }

      if ( SafetyUtil.isEmpty(sourceCountry) || SafetyUtil.isEmpty(targetCountry) ) return false;

      return new PaymentCorridorService().canProcessCurrencyPair(((X) obj), getProviderId(), 
        sourceCountry, targetCountry, sourceCurrency, targetCurrency);
      
      `
    }
  ]
});