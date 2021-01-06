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
  package: 'net.nanopay.fx.localfx',
  name: 'NanopayFXService',

  documentation: 'An impelementation of FXService that gets FX Rates from ExchangeRateDAO',

  implements: [
    'net.nanopay.fx.FXService'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.ExchangeRate',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXProvider',
    'net.nanopay.fx.FXService',
  ],

  properties: [
    {
      class: 'Long',
      name: 'feeAmount',
      value: 1
    },
  ],

  methods: [
    {
      name: 'getFXRate',
      javaCode: `
        X x = getX();
        DAO exchangeRateDAO_ = (DAO) x.get("exchangeRateDAO");
        DAO fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");

        final FXQuote fxQuote = new FXQuote();
        if ( SafetyUtil.isEmpty(fxProvider)) fxProvider = new FXProvider.Builder(x).build().getId();

        // Fetch rates from exchangeRateDAO_
        exchangeRateDAO_.where(
            MLang.AND(
                MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
                MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency),
                MLang.EQ(ExchangeRate.FX_PROVIDER, fxProvider)
            )
        ).select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {

            fxQuote.setSourceCurrency(((ExchangeRate) obj).getFromCurrency());
            fxQuote.setTargetCurrency(((ExchangeRate) obj).getToCurrency());
            fxQuote.setExternalId(((ExchangeRate) obj).getDealReferenceNumber());
            fxQuote.setStatus(((ExchangeRate) obj).getFxStatus().getLabel());
            fxQuote.setRate(((ExchangeRate) obj).getRate());
            fxQuote.setExpiryTime(((ExchangeRate) obj).getExpirationDate());
          }
        });

        Double amount = 0.0;

        if ( sourceAmount < 1 ) {
          amount = destinationAmount * fxQuote.getRate();
          sourceAmount = Math.round(amount);
        }

        if ( destinationAmount < 1 ) {
          amount = sourceAmount * fxQuote.getRate();
          destinationAmount = Math.round(amount);
        }

        fxQuote.setTargetAmount(destinationAmount);
        fxQuote.setSourceAmount(sourceAmount);
        fxQuote.setFee(getFeeAmount());
        fxQuote.setFeeCurrency(sourceCurrency);

        return (FXQuote) fxQuoteDAO_.put_(x, fxQuote);
      `
    },
    {
      name: 'getFXSpotRate',
      javaCode: `
        // Temporary implementation
        return 1.0;
      `
    },
    {
      name: 'acceptFXRate',
      javaCode: `
        X x = getX();
        DAO fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
        FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(quoteId));
        if  ( null != quote ) {
          quote = (FXQuote) quote.fclone();
          quote.setStatus(ExchangeRateStatus.ACCEPTED.getName());
          fxQuoteDAO_.put_(x, quote);
          return true;
        }
        return false;
      `
    }
  ]
});
