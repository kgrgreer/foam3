foam.CLASS({
  package: 'net.nanopay.tx.planner.predicate',
  name: 'ProviderPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.afex.AFEXBusiness',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.ascendantfx.AscendantFXServiceProvider',
    'net.nanopay.fx.ascendantfx.AscendantFXUser',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.NEW_OBJ'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.payment.PaymentProvider',
      name: 'provider'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) NEW_OBJ.f(obj);

      if ( ! quote.getCorridorsEnabled() ) return true; // override when corridor check disabled.

      if (quote.getEligibleProviders().get(getProvider()) != null )
        return (Boolean) quote.getEligibleProviders().get(getProvider());
      return false;

      `
    }
  ]
});
