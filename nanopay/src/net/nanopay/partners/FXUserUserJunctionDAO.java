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
import net.nanopay.bank.BankAccount;
import net.nanopay.fx.FXPayee;
import net.nanopay.fx.FXService;
import net.nanopay.model.Currency;
import net.nanopay.payment.Institution;

/**
 * AscendantFX userUserJunctionDAO
 *
 * Features:
 *  - IF Source User Group is OpenText, then call AscendantFX to create as Payee on their system
 */
public class FXUserUserJunctionDAO
  extends ProxyDAO
{
  public FXUserUserJunctionDAO(X x, DAO delegate) {
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
    
    // If both partners have same currency there would be no need for FX, hence no need for AscendantFX AddPayee Call
    if ( sourceUserCurrency.equalsIgnoreCase(targetUserCurrency)) 
      return getDelegate().put_(x, obj);

//    if ( ! "OPENTEXT_USER_GROUP".equalsIgnoreCase(sourceUser.getGroup()) )
//      return getDelegate().put_(x, obj);

    
    addPayee(targetUser, targetUserCurrency);


    return getDelegate().put_(x, obj);
  }


  private void addPayee(User user, String targetUserCurrency) {
    FXService fxService = (FXService) getX().get("ascendantFXService");
    BankAccount bankAccount = BankAccount.findDefault(getX(), user, targetUserCurrency);
    Institution institution;
    if ( null != bankAccount ) {
      DAO institutionDAO = (DAO) getX().get("institutionDAO");
      institution = (Institution) institutionDAO.find_(getX(), bankAccount.getInstitution());

      if ( null != institution ) {
        FXPayee fxPayee = new FXPayee.Builder(getX()).build();
        fxPayee.setUser(user.getId());
        fxPayee.setPayeeAddress1(user.getAddress().getAddress1());
        fxPayee.setPayeeName(user.getBusinessName());
        fxPayee.setPayeeEmail(user.getEmail());
        fxPayee.setPayeeReference(String.valueOf(user.getId()));
        fxPayee.setPayeeBankName(institution.getName());
        fxPayee.setPayeeBankCountryID(institution.getCountryId());
        fxPayee.setPayeeBankSwiftCode(bankAccount.getSwiftCode());
        fxPayee.setPayeeBankRoutingCode(null); //TODO:
        fxPayee.setPayeeBankRoutingType(null); //TODO

        fxService.addFXPayee(fxPayee);

      }
    }
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
      logger.warning(FXUserUserJunctionDAO.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
    }
    return denomination;
  }
  
}
