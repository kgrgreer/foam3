package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.EQ;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.logger.Logger;
import java.util.List;
import net.nanopay.fx.ascendantfx.AscendantFX;
import net.nanopay.fx.ascendantfx.AscendantFXServiceProvider;
import net.nanopay.model.Currency;
import net.nanopay.payment.PaymentService;

/**
 * AscendantFX userUserJunctionDAO
 *
 * Features:
 *  - IF Source User Group is OpenText, then call AscendantFX to create as Payee on their system
 */
public class AscendantFXUserUserJunctionDAO
  extends ProxyDAO
{
  public AscendantFXUserUserJunctionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    DAO userDAO = (DAO) x.get("localUserDAO");
    UserUserJunction entity = (UserUserJunction) obj;

    User sourceUser = (User) userDAO.find_(x, entity.getSourceId());
    if ( null == sourceUser ) return getDelegate().put_(x, obj);
    String sourceUserCurrency = getUserDefaultCurrency(sourceUser);

    User targetUser = (User) userDAO.find_(x, entity.getTargetId());
    String targetUserCurrency = getUserDefaultCurrency(targetUser);

    // If both partners have same currency there would be no need for FX, hence no need for Add Payee Call
    if ( sourceUserCurrency.equalsIgnoreCase(targetUserCurrency) )
      return getDelegate().put_(x, obj);

    AscendantFX ascendantFX = (AscendantFX) x.get("ascendantFX");
    PaymentService paymentService = new AscendantFXServiceProvider(x, ascendantFX);
    paymentService.addPayee(targetUser.getId());

    return getDelegate().put_(x, obj);

  }


  private String getUserDefaultCurrency(User user) {
    Logger logger = (Logger) getX().get("logger");
    String denomination = "CAD";
    String country = "CA";
    Address address = user.getAddress();
    if ( address != null && address.getCountryId() != null ) {
      country = address.getCountryId();
    }
    DAO currencyDAO = (DAO) getX().get("currencyDAO");
    List currencies = ((ArraySink) currencyDAO
        .where(
            EQ(Currency.COUNTRY, country)
        )
        .select(new ArraySink())).getArray();
    if ( currencies.size() == 1 ) {
      denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
    } else if ( currencies.size() > 1 ) {
      logger.warning(AscendantFXUserUserJunctionDAO.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
    }
    return denomination;
  }

}
