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
  name: 'ProviderPredicate',
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
