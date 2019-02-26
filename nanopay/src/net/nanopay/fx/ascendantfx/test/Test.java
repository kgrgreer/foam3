package net.nanopay.fx.ascendantfx.test;

import foam.core.ProxyX;
import foam.lib.json.Outputter;
import net.nanopay.fx.ascendantfx.AscendantFXService;
import net.nanopay.fx.ascendantfx.model.Deal;
import net.nanopay.fx.ascendantfx.model.Direction;
import net.nanopay.fx.ascendantfx.model.GetQuoteRequest;

public class Test {

  public static void main(String[] args) {
    AscendantFXService service = new AscendantFXService(new ProxyX());
    GetQuoteRequest request = new GetQuoteRequest();
    request.setMethodID("AFXEWSGQ");
    request.setOrgID("5904960");

    Deal deal = new Deal();
    deal.setDirection(Direction.Buy);
    deal.setFee(0);
    deal.setFxAmount(1);
    deal.setFxCurrencyID("USD");
    deal.setPaymentMethod("Wire");
    deal.setPaymentSequenceNo(1);
    deal.setRate(0);
    deal.setSettlementAmount(0);
    deal.setSettlementCurrencyID("CAD");
    deal.setTotalSettlementAmount(0);

    request.setPayment(new Deal[] { deal });

    request.setTotalNumberOfPayment(1);
    System.out.println(new Outputter().stringify(service.getQuote(request)));
  }
}
