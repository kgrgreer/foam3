foam.CLASS({
  package: 'net.nanopay.tx.planner.predicates',
  name: 'FXPlannerPredicate',
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

  constants: [
    {
      type: 'String',
      name: 'AFEX_SERVICE_NSPEC_ID',
      value: 'afexServiceProvider'
    },
    {
      type: 'String',
      name: 'ASCENDANTFX_SERVICE_NSPEC_ID',
      value: 'ascendantFXService'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceProviderName'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) NEW_OBJ.f(obj);
      Transaction t = quote.getRequestTransaction();

      if ( getServiceProviderName().equals(AFEX_SERVICE_NSPEC_ID) ) {
        FXService fxService = CurrencyFXService.getFXServiceByNSpecId(getX(), t.getSourceCurrency(),
        t.getDestinationCurrency(), AFEX_SERVICE_NSPEC_ID);
        if ( ! (fxService instanceof AFEXServiceProvider) ) {
          return false;
        }

        AFEXServiceProvider afexService = (AFEXServiceProvider) fxService;
        AFEXBusiness afexBusiness = afexService.getAFEXBusiness(getX(), quote.getSourceAccount().getOwner());
        if ( afexBusiness == null ) {
          return false;
        }
      } else {
        FXService fxService = CurrencyFXService.getFXServiceByNSpecId(getX(), t.getSourceCurrency(),
        t.getDestinationCurrency(), ASCENDANTFX_SERVICE_NSPEC_ID);
        if ( ! (fxService instanceof AscendantFXServiceProvider) ) {
          return false;
        }
  
        // Validate that Payer is provisioned for AFX before proceeding
        try {
          AscendantFXUser.getUserAscendantFXOrgId(getX(),  quote.getSourceAccount().getOwner());
        } catch (Exception e) {
          return false;
        }  
      }

      return true;
      `
    }
  ]
});
