package net.nanopay.fx.ascendantfx;

import foam.core.X;
import foam.dao.DAO;
import net.nanopay.fx.ExchangeRateQuote;
import net.nanopay.fx.FXService;
import net.nanopay.tx.cron.ExchangeRatesCron;

public class AscendantFXServiceTest
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

    fxService = (FXService) x.get("ascendantFXService");

    testGetFXRate();
    testAcceptFXRate();

  }

  public void testGetFXRate() {
    ExchangeRatesCron cron = new ExchangeRatesCron();
    cron.execute(x_);
    ExchangeRateQuote quote = fxService.getFXRate("USD", "CAD", 100.0, "Buy", null, 0);
    test( null != quote, "FX Quote was returned" );
    test( null != quote.getId(), "Quote has an ID: " + quote.getId() );
    test( "USD".equals(quote.getExchangeRate().getSourceCurrency()), "Quote has Source Currency" );
    test( quote.getExchangeRate().getRate() > 0, "FX rate was returned: " + quote.getExchangeRate().getRate() );

  }

  public void testAcceptFXRate() {

    ExchangeRateQuote quote = fxService.getFXRate("USD", "CAD", 100.0, "Buy", null, 0);
    test( null != quote.getId(), "Quote has an ID: " + quote.getId() );

    Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(quote.getId()), 0);
    test( fxAccepted, "FX Quote was accepted" );

  }

}
