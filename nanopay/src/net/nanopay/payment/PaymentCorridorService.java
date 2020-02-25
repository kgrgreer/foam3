package net.nanopay.payment;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.nanos.NanoService;
import foam.util.SafetyUtil;
import net.nanopay.fx.Corridor;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.CONTAINS_IC;
import foam.nanos.logger.Logger;

public class PaymentCorridorService implements CorridorService {

  public Corridor getCorridor(X x, String sourceCountry, String targetCountry) {
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

}
