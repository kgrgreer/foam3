package net.nanopay.payment;

import foam.core.X;
import foam.dao.DAO;
import net.nanopay.fx.Corridor;

public class PaymentCorridorServiceTest extends foam.nanos.test.Test {

  DAO corridorDAO, paymentProviderCorridorJunctionDAO;
  Corridor c;
  PaymentProviderCorridorJunction j;
  long p = 4L;

  public void runTest(X x) {
    corridorDAO = (DAO) x.get("corridorDAO");
    paymentProviderCorridorJunctionDAO = (DAO) x.get("paymentProviderCorridorJunctionDAO");

    setUpTest(x);
    testCanHandleCorridor(x);
    testIsSupportedCurrencyPair(x);
    tearDownTest();
  }

  public void setUpTest(X x) {
    c = (Corridor) corridorDAO.put(
      new Corridor.Builder(x).setSourceCountry("CA")
      .setTargetCountry("US")
      .build());

    j = (PaymentProviderCorridorJunction) paymentProviderCorridorJunctionDAO.put(
      new PaymentProviderCorridorJunction.Builder(x).setSourceId(p)
      .setTargetId(c.getId())
      .setCurrencies(new String[]{"CAD","USD"})
      .build());
  }

  public void tearDownTest() {
    paymentProviderCorridorJunctionDAO.remove(j);
    corridorDAO.remove(c);
  }

  public void testCanHandleCorridor(X x) {
    PaymentCorridorService s = new PaymentCorridorService();
    test(s.canProcessCurrencyPair(x, p, "CA", "US", "CAD", "USD"), "Payment Provider can handle corridor.");
    test(! s.canProcessCurrencyPair(x, p, "CA", "IN", "CAD", "USD"), "Payment Provider cannot handle corridor");
    test(! s.canProcessCurrencyPair(x, p, "CA", "US", "CAD", "INR"), "Payment Provider cannot handle currency.");
    test(! s.canProcessCurrencyPair(x, p, null, null, "CAD", "INR"), "Null country handled.");
  }

  public void testIsSupportedCurrencyPair(X x) {
    PaymentCorridorService s = new PaymentCorridorService();
    test(s.isSupportedCurrencyPair(x, "CA", "US", "CAD", "USD"), "Currency pair is supported on the platform.");
    test(! s.isSupportedCurrencyPair(x, "CA", "US", "CAD", "UDX"), "Corridor not supported");
    test(! s.isSupportedCurrencyPair(x, "CA", "US", "CAD", null), "null currency handled");
  }

 }
