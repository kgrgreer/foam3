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
  package: 'net.nanopay.tx.planner.predicate',
  name: 'FXPlannerPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.afex.AFEXUser',
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
        AFEXUser afexUser = afexService.getAFEXUser(getX(), quote.getSourceAccount().getOwner());
        if ( afexUser == null ) {
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
