package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.fx.ascendantfx.AscendantFX;
import net.nanopay.fx.ascendantfx.AscendantFXServiceProvider;
import net.nanopay.payment.PaymentService;

/**
 * This DAO would create and push Payee to AscendantFX if the owner of the
 * bank account belongs to OpenText group and also create notification for
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

    //Check if account owner belongs to OpenText group
    DAO userDAO = (DAO) getX().get("localUserDAO");
    User accountOwner = (User) userDAO.find_(getX(), account.getOwner());
    if ( null != accountOwner && accountOwner.getSpid().equalsIgnoreCase("opentext") ) {

      //Create Ascendant Organization notification
      String message = "Organization setup on AscendantFX system is required for User with id: " + accountOwner.getId() ;
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
    ((DAO) x.get("notificationDAO")).put(notification);
    ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
    }

    return super.put_(x, obj);
  }

}
