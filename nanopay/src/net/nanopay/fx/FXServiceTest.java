package net.nanopay.fx;

import foam.core.X;
import foam.dao.DAO;
import net.nanopay.tx.cron.ExchangeRatesCron;

public class FXServiceTest
    extends foam.nanos.test.Test {

  private FXService fxService;
  protected DAO fxQuoteDAO_;
  protected DAO fxDealDAO_;
  X x_;

  @Override
  public void runTest(X x) {

    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    fxDealDAO_ = (DAO) x.get("fxDealDAO");
    x_ = x;

    fxService = (FXService) x.get("localFXService");

    testGetFXRate();
    testAcceptFXRate();

  }

  public void testGetFXRate() {
    ExchangeRatesCron cron = new ExchangeRatesCron();
    cron.execute(x_);
    ExchangeRateQuote quote = fxService.getFXRate("CAD", "INR", 100.0, "Buy", null, 0);
    test( null != quote, "FX Quote was returned" );
    test( null != quote.getId(), "Quote has an ID: " + quote.getId() );
    test( "CAD".equals(quote.getExchangeRate().getSourceCurrency()), "Quote has Source Currency" );
    test( quote.getExchangeRate().getRate() > 0, "FX rate was returned: " + quote.getExchangeRate().getRate() );

  }

  public void testAcceptFXRate() {

    ExchangeRateQuote quote = fxService.getFXRate("CAD", "INR", 100.0, "Buy", null, 0);
    test( null != quote.getId(), "Quote has an ID: " + quote.getId() );

    FXQuote fxQuote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(quote.getId()));
    test( null != fxQuote, "FX Quote was returned" );
    if ( null != fxQuote ) {
      Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 0);
      test( fxAccepted, "FX Quote was accepted" );
    }

  }

}
