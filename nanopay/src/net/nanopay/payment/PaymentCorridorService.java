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

package net.nanopay.payment;

import foam.core.X;
import foam.core.XLocator;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.util.SafetyUtil;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.TrustAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.TransactionQuote;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.CONTAINS_IC;

public class PaymentCorridorService implements CorridorService {

  public PaymentProviderCorridor getProviderCorridor(X x, String providerId, String sourceCountry, String targetCountry) {
    DAO dao = (DAO) x.get("paymentProviderCorridorDAO");

    return (PaymentProviderCorridor) dao.find(
      AND(
        EQ(PaymentProviderCorridor.PROVIDER, providerId),
        EQ(PaymentProviderCorridor.SOURCE_COUNTRY, sourceCountry),
        EQ(PaymentProviderCorridor.TARGET_COUNTRY, targetCountry)
      )
    );
  }

  public boolean isSupportedCurrencyPair(X x, String sourceCountry, String targetCountry, String sourceCurrency, String targetCurrency) {
    if ( SafetyUtil.isEmpty(sourceCurrency) || SafetyUtil.isEmpty(targetCurrency) ) return false;

    DAO dao = (DAO) x.get("paymentProviderCorridorDAO");
    Count count = (Count) dao.where(
      AND(
        EQ(PaymentProviderCorridor.SOURCE_COUNTRY, sourceCountry),
        EQ(PaymentProviderCorridor.TARGET_COUNTRY, targetCountry),
        CONTAINS_IC(PaymentProviderCorridor.SOURCE_CURRENCIES, sourceCurrency),
        CONTAINS_IC(PaymentProviderCorridor.TARGET_CURRENCIES, targetCurrency)
      )
    ).select(new Count());

    return count.getValue() > 0;
  }

  public boolean canProcessCurrencyPair(X x, String providerId, String sourceCountry, String targetCountry, String sourceCurrency, String targetCurrency) {
    DAO dao = (DAO) x.get("paymentProviderCorridorDAO");
    PaymentProviderCorridor junction = (PaymentProviderCorridor) dao.find(
      AND(
        EQ(PaymentProviderCorridor.PROVIDER, providerId),
        EQ(PaymentProviderCorridor.SOURCE_COUNTRY, sourceCountry),
        EQ(PaymentProviderCorridor.TARGET_COUNTRY, targetCountry),
        CONTAINS_IC(PaymentProviderCorridor.SOURCE_CURRENCIES, sourceCurrency),
        CONTAINS_IC(PaymentProviderCorridor.TARGET_CURRENCIES, targetCurrency)
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
      BankAccount r = null;
      if ( from instanceof DigitalAccount )
        r = ((BankAccount) ((DigitalAccount) from).findTrustAccount(x).findReserveAccount(x));
      else
        r = (BankAccount) TrustAccount.find(x,from).findReserveAccount(x);
      if (r != null)
        sourceCountry = r.getCountry();
    }

    if ( to instanceof BankAccount ) {
      targetCountry = ((BankAccount) to).getCountry();
    } else {
      BankAccount r = null;
      if ( to instanceof DigitalAccount )
        r = ((BankAccount) ((DigitalAccount) to).findTrustAccount(x).findReserveAccount(x));
      else
        r = (BankAccount) TrustAccount.find(x,to).findReserveAccount(x);
      if (r != null)
        targetCountry = r.getCountry();
    }

    if ( SafetyUtil.isEmpty(sourceCountry) || SafetyUtil.isEmpty(targetCountry) ) Collections.emptyList();

    // Query payment provider corridors with respect to the request context so
    // that filtering based on the user permissions is properly applied.
    return getCorridorPaymentProviders(XLocator.get(),
      sourceCountry, targetCountry, sourceCurrency, targetCurrency);

  }

  public List getCorridorPaymentProviders(X x, String sourceCountry, String targetCountry, String sourceCurrency, String targetCurrency) {
    List junctions = new ArrayList<>();
    if ( SafetyUtil.isEmpty(sourceCurrency) || SafetyUtil.isEmpty(targetCurrency) ) return junctions;

    junctions =  ((ArraySink) ((DAO) x.get("paymentProviderCorridorDAO")).inX(x).where(
      AND(
        EQ(PaymentProviderCorridor.SOURCE_COUNTRY, sourceCountry),
        EQ(PaymentProviderCorridor.TARGET_COUNTRY, targetCountry),
        CONTAINS_IC(PaymentProviderCorridor.SOURCE_CURRENCIES, sourceCurrency),
        CONTAINS_IC(PaymentProviderCorridor.TARGET_CURRENCIES, targetCurrency)
      )
    ).orderBy(PaymentProviderCorridor.RANKING).select(new ArraySink())).getArray();

    return junctions;
  }

  public List getAllWithSrc(X x, String sourceCurrency) {
    List junctions = new ArrayList<>();
    if ( SafetyUtil.isEmpty(sourceCurrency) ) return junctions;

    junctions =  ((ArraySink) ((DAO) x.get("paymentProviderCorridorDAO")).where(
      AND(
        CONTAINS_IC(PaymentProviderCorridor.SOURCE_CURRENCIES, sourceCurrency)
      )
    ).orderBy(PaymentProviderCorridor.RANKING).select(new ArraySink())).getArray();

    return junctions;
  }

  public List getAllWithTarget(X x, String targetCurrency) {
    List junctions = new ArrayList<>();
    if ( SafetyUtil.isEmpty(targetCurrency) ) return junctions;

    junctions =  ((ArraySink) ((DAO) x.get("paymentProviderCorridorDAO")).where(
      AND(
        CONTAINS_IC(PaymentProviderCorridor.TARGET_CURRENCIES, targetCurrency)
        )
    ).orderBy(PaymentProviderCorridor.RANKING).select(new ArraySink())).getArray();

    return junctions;
  }

  public List getAllWithSrcForProvider(X x, String sourceCurrency, String provider) {
    List junctions = new ArrayList<>();
    if ( SafetyUtil.isEmpty(sourceCurrency) ) return junctions;

    junctions =  ((ArraySink) ((DAO) x.get("paymentProviderCorridorDAO")).where(
      AND(
        CONTAINS_IC(PaymentProviderCorridor.SOURCE_CURRENCIES, sourceCurrency),
        EQ(PaymentProviderCorridor.PROVIDER, provider)
      )
    ).orderBy(PaymentProviderCorridor.RANKING).select(new ArraySink())).getArray();

    return junctions;
  }

}
