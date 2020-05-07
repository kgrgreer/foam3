package net.nanopay.payment;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.fx.Corridor;
import net.nanopay.tx.TransactionQuote;

public class PaymentCorridorServiceTest extends foam.nanos.test.Test {

  DAO corridorDAO, paymentProviderCorridorJunctionDAO;
  Corridor c;
  PaymentProviderCorridorJunction j;
  String p = "AFEX";

  public void runTest(X x) {
    corridorDAO = (DAO) x.get("corridorDAO");
    paymentProviderCorridorJunctionDAO = (DAO) x.get("paymentProviderCorridorJunctionDAO");

    setUpTest(x);
    testCanHandleCorridor(x);
    testIsSupportedCurrencyPair(x);
    testGetCorridorPaymentProviders(x);
    testTransactionQuotePaymentProviders(x);
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

  public void testGetCorridorPaymentProviders(X x) {
    PaymentCorridorService s = new PaymentCorridorService();
    test(s.getCorridorPaymentProviders(x, "CA", "US", "CAD", "USD").size() == 1, "Currency pair is supported on the platform.");
    test(s.getCorridorPaymentProviders(x, "CA", "US", "CAD", "UDX").size() == 0, "Corridor not supported");
    test(s.getCorridorPaymentProviders(x, "CA", "US", "CAD", null).size() == 0, "null currency handled");
  }

  public void testTransactionQuotePaymentProviders(X x) {
    PaymentCorridorService s = new PaymentCorridorService();
    TransactionQuote quote = new TransactionQuote.Builder(x)
      .setSourceAccount(createTestBankAccount(x, "CAD"))
      .setDestinationAccount(createTestBankAccount(x, "USD"))
      .build();
    test(s.getQuoteCorridorPaymentProviders(x, quote).size() == 1, "Currency pair in quote is supported on the platform.");

    TransactionQuote quote2 = new TransactionQuote.Builder(x)
      .setSourceAccount(createTestBankAccount(x, "CAD"))
      .setDestinationAccount(createTestBankAccount(x, "INR"))
      .build();
    test(s.getQuoteCorridorPaymentProviders(x, quote2).size() == 0, "Corridor in quote2 not supported");
    test(s.getQuoteCorridorPaymentProviders(x, null).size() == 0, "null quote handled");

    TransactionQuote quote3 = new TransactionQuote.Builder(x)
      .setSourceAccount(createTestDigitalAccount(x, "CAD"))
      .setDestinationAccount(createTestDigitalAccount(x, "USD"))
      .build();
    test(s.getQuoteCorridorPaymentProviders(x, quote3).size() == 1, "Currency pair in quote3 is supported on the platform.");
  }

  private BankAccount createTestBankAccount(X x, String denomination) {
    BankAccount testBankAccount = null;
    if ( "USD".equals(denomination) ) {
      return new USBankAccount.Builder(x)
        .setDenomination(denomination)
        .setOwner(1000)
        .build();
    }

    return new CABankAccount.Builder(x)
      .setDenomination(denomination)
      .setOwner(1000)
      .build();
  }

  private DigitalAccount createTestDigitalAccount(X x, String denomination){
    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find_(x, 1348L);
    return DigitalAccount.findDefault(x, user, denomination);
  }

 }
