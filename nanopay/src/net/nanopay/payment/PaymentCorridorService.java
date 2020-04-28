package net.nanopay.payment;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.nanos.NanoService;
import foam.util.SafetyUtil;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import net.nanopay.account.Account;
import net.nanopay.account.TrustAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.fx.Corridor;
import net.nanopay.tx.TransactionQuote;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.CONTAINS_IC;
import foam.nanos.logger.Logger;

public class PaymentCorridorService implements CorridorService {

  public Corridor getCorridor(X x, String sourceCountry, String targetCountry) {
    if ( SafetyUtil.isEmpty(sourceCountry) || SafetyUtil.isEmpty(targetCountry) ) return null;
    DAO corridorDAO = (DAO) x.get("corridorDAO");
    return (Corridor) corridorDAO.find(
      AND(
        EQ(Corridor.SOURCE_COUNTRY, sourceCountry),
        EQ(Corridor.TARGET_COUNTRY, targetCountry)
      )
    );
  }

  public PaymentProviderCorridorJunction getProviderCorridor(X x, long providerId, String sourceCountry, String targetCountry) {
    DAO dao = (DAO) x.get("paymentProviderCorridorJunctionDAO");
    Corridor corridor = getCorridor(x, sourceCountry, targetCountry);
    if ( corridor == null ) return null;

    return (PaymentProviderCorridorJunction) dao.find(
      AND(
        EQ(PaymentProviderCorridorJunction.SOURCE_ID, providerId),
        EQ(PaymentProviderCorridorJunction.TARGET_ID, corridor.getId())
      )
    );
  }

  public boolean isSupportedCurrencyPair(X x, String sourceCountry, String targetCountry, String sourceCurrency, String targetCurrency) {
    if ( SafetyUtil.isEmpty(sourceCurrency) || SafetyUtil.isEmpty(targetCurrency) ) return false;

    Corridor corridor = getCorridor(x, sourceCountry, targetCountry);
    if ( corridor == null ) return false;

    DAO dao = (DAO) x.get("paymentProviderCorridorJunctionDAO");

    Count count = (Count) dao.where(
      AND(
        EQ(PaymentProviderCorridorJunction.TARGET_ID, corridor.getId()),
        CONTAINS_IC(PaymentProviderCorridorJunction.CURRENCIES, sourceCurrency),
        CONTAINS_IC(PaymentProviderCorridorJunction.CURRENCIES, targetCurrency)
      )
    ).select(new Count());

    return count.getValue() > 0;
  }

  public boolean canProcessCurrencyPair(X x, long providerId, String sourceCountry, String targetCountry, String sourceCurrency, String targetCurrency) {
    Corridor corridor = getCorridor(x, sourceCountry, targetCountry);
    if ( corridor == null ) return false;

    DAO dao = (DAO) x.get("paymentProviderCorridorJunctionDAO");
    PaymentProviderCorridorJunction junction = (PaymentProviderCorridorJunction) dao.find(
      AND(
        EQ(PaymentProviderCorridorJunction.SOURCE_ID, providerId),
        EQ(PaymentProviderCorridorJunction.TARGET_ID, corridor.getId()),
        CONTAINS_IC(PaymentProviderCorridorJunction.CURRENCIES, sourceCurrency),
        CONTAINS_IC(PaymentProviderCorridorJunction.CURRENCIES, targetCurrency)
      )
    );

    return junction != null;
  }

  public List getQuoteCorridorPaymentProviders(X x, TransactionQuote transactionQuote) {
    if ( transactionQuote == null ) return Collections.emptyList();
    Account from = transactionQuote.getSourceAccount();
    Account to = transactionQuote.getDestinationAccount();
    
    if ( from == null || to == null ) return Collections.emptyList();

    String sourceCountry  = "";
    String targetCountry  = "";
    String sourceCurrency = from.getDenomination();
    String targetCurrency = to.getDenomination();

    if ( from instanceof BankAccount ) {
      sourceCountry = ((BankAccount) from).getCountry();
    } else {
      sourceCountry = ((BankAccount) TrustAccount.find(x,from)
        .findReserveAccount(x)).getCountry();
    }

    if ( to instanceof BankAccount ) {
      targetCountry = ((BankAccount) to).getCountry();
    } else {
      targetCountry = ((BankAccount) TrustAccount.find(x,to)
          .findReserveAccount(x)).getCountry();
    }

    if ( SafetyUtil.isEmpty(sourceCountry) || SafetyUtil.isEmpty(targetCountry) ) Collections.emptyList();

    return getCorridorPaymentProviders(x, 
      sourceCountry, targetCountry, sourceCurrency, targetCurrency);

  }

  public List getCorridorPaymentProviders(X x, String sourceCountry, String targetCountry, String sourceCurrency, String targetCurrency) {
    List junctions = new ArrayList<>();
    if ( SafetyUtil.isEmpty(sourceCurrency) || SafetyUtil.isEmpty(targetCurrency) ) return junctions;
    Corridor corridor = getCorridor(x, sourceCountry, targetCountry);
    if ( corridor == null ) return junctions;

    junctions =  ((ArraySink) ((DAO) x.get("paymentProviderCorridorJunctionDAO")).where(
      AND(
        EQ(PaymentProviderCorridorJunction.TARGET_ID, corridor.getId()),
        CONTAINS_IC(PaymentProviderCorridorJunction.CURRENCIES, sourceCurrency),
        CONTAINS_IC(PaymentProviderCorridorJunction.CURRENCIES, targetCurrency)
      )
    ).select(new ArraySink())).getArray();

    return junctions;
  }

}
