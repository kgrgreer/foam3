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
  package: 'net.nanopay.tx.fee',
  name: 'SpotRate',
  extends: 'net.nanopay.tx.fee.Fee',

  documentation: 'The current spot rate from the Forex for use as fee.',

  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.tx.model.Transaction'
  ],

  messages: [
    { name: 'FORMULA_PREFIX', message: 'SpotRate' }
  ],

  properties: [
    {
      name: 'formula',
      transient: true,
      visibility: 'HIDDEN',
      tableCellFormatter: function(_, obj) {
        this.add(obj.FORMULA_PREFIX);
      }
    },
    {
      class: 'Boolean',
      name: 'useInvertedRate'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'sourceCurrencyExpr'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'destinationCurrencyExpr'
    }
  ],

  methods: [
    {
      name: 'getRate',
      javaCode: `
        var transaction = (Transaction) obj;
        var sourceCurrency = transaction.getSourceCurrency();
        var destinationCurrency = transaction.getDestinationCurrency();

        if ( getSourceCurrencyExpr() != null ) {
          sourceCurrency = String.valueOf(getSourceCurrencyExpr().f(transaction));
        }
        if ( getDestinationCurrencyExpr() != null ) {
          destinationCurrency = String.valueOf(getDestinationCurrencyExpr().f(transaction));
        }
        var sender = transaction.findSourceAccount(getX()).findOwner(getX());
        var fxService = CurrencyFXService.getFXService(getX(),
          sourceCurrency, destinationCurrency, sender.getSpid());

        // The FX spot rate is the conversion rate from 1 unit in the source
        // currency to the destination currency.
        //
        // Eg., the conversion rate of 0.18 for sourceCurrency=BRL and
        // destinationCurrency=USD means 1 BRL = 0.18 USD.
        var spotRate = fxService.getFXSpotRate(sourceCurrency, destinationCurrency, sender.getId());
        return getUseInvertedRate() ? ( 1.0 / spotRate ) : spotRate;
      `
    }
  ]
});
