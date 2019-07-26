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
 * This DAO would create an AscendantFXUser if the owner of the
 * has the required permission and also create notification for
 * manual setup of organization.
 */
public class AscendantFXBankAccountDAO
    extends ProxyDAO {

  public AscendantFXBankAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( !(obj instanceof BankAccount) ) {
      return getDelegate().put_(x, obj);
    }

    BankAccount account = (BankAccount) obj;
    AuthService auth = (AuthService) x.get("auth");
    DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
    User accountOwner = (User) localBusinessDAO.find(account.getOwner());
    boolean hasFXProvisionPayerPermission = false;
    if ( accountOwner != null ) {
      // accountOwner is null in some test cases
      hasFXProvisionPayerPermission = auth.checkUser(getX(), accountOwner, "fx.provision.payer");
    }
    if ( hasFXProvisionPayerPermission ) {

      DAO ascendantFXUserDAO = (DAO) getX().get("ascendantFXUserDAO");
      AscendantFXUser ascendantFXUser = (AscendantFXUser) ascendantFXUserDAO.find(MLang.AND(
          MLang.EQ(AscendantFXUser.USER, accountOwner.getId())));

      if ( null == ascendantFXUser ) {
        ascendantFXUser = new AscendantFXUser();
        ascendantFXUser.setName(accountOwner.getLegalName());
        ascendantFXUser.setUser(accountOwner.getId());
        ascendantFXUser.setUserStatus(FXUserStatus.PENDING);
        ascendantFXUserDAO.put_(x, ascendantFXUser);

        //Create Ascendant Organization notification
        String message = "Organization setup on AscendantFX system is required for User with id: " + accountOwner.getId() ;
        Notification notification = new Notification.Builder(x)
          .setTemplate("NOC")
          .setBody(message)
          .build();
      ((DAO) x.get("localNotificationDAO")).put(notification);
      ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);

      }


    }

    return super.put_(x, obj);
  }

}
