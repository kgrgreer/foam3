package net.nanopay.onboarding.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.util.HashMap;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;

public class RegistrationDisabledEmailDAO
  extends ProxyDAO
{

  public RegistrationDisabledEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // Checks if User exists and is login enabled
    User user = (User) obj;
    if ( getDelegate().find(user.getId()) == null || ! user.getLoginEnabled())
      return getDelegate().put_(x, obj);

    // Makes sure to only send on status change
    User oldUser = (User) getDelegate().find(user.getId());
    if ( oldUser.getStatus().equals(user.getStatus()) )
      return getDelegate().put_(x, obj);

    // Makes sure the user is not already DISABLED
    if ( ! AccountStatus.DISABLED.equals(user.getStatus()) )
      return getDelegate().put_(x, obj);

    user = (User) super.put_(x , obj);
    EmailService            email     = (EmailService) x.get("email");
    EmailMessage            message   = new EmailMessage();
    HashMap<String, Object> args      = new HashMap<>();

    message.setTo(new String[]{user.getEmail()});
    args.put("name",    user.getFirstName());

    try{
      email.sendEmailFromTemplate(x, user, message, "reg-failed", args);
    } catch (Throwable t) {
      ( x.get(Logger.class)).error("Error sending failed registration email.", t);
    }

    return user;
  }
}

