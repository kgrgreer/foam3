package net.nanopay.bank;

import foam.core.FObject;
import foam.mlang.MLang;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.fx.FXUserStatus;
import net.nanopay.fx.ascendantfx.AscendantFXUser;

/**
 * This DAO would onboard user as a client on AFEX by calling AFEX API and then c
 * reates AFEXUser if the owner of the account has the required permission 
 */
public class AFEXClientOnboardingDAO
    extends ProxyDAO {

  public AFEXClientOnboardingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( !(obj instanceof BankAccount) ) {
      return getDelegate().put_(x, obj);
    }

    BankAccount account = (BankAccount) obj;
    BankAccount existingAccount = (BankAccount) getDelegate().find(account.getId());
    if ( existingAccount != null && existingAccount.getStatus == BankAccountStatus.UNVERIFIED 
          &&  account.getStatus == BankAccountStatus.VERIFIED ) {
      
      // TODO: Check if business is already pushed to AFEX?

      AuthService auth = (AuthService) x.get("auth");
      DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
      User accountOwner = (User) localBusinessDAO.find(account.getOwner());
      boolean hasFXProvisionPayerPermission = auth.checkUser(getX(), accountOwner, "fx.provision.payer");
      boolean hasCurrencyReadUSDPermission = auth.checkUser(getX(), accountOwner, "currency.read.USD");
      if ( hasFXProvisionPayerPermission && hasCurrencyReadUSDPermission ) {
  
      }

    }



    return super.put_(x, obj);
  }

}
