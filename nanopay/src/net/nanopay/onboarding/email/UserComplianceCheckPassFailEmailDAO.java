package net.nanopay.onboarding.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.util.HashMap;
import java.util.Map;
import net.nanopay.admin.model.ComplianceStatus;

public class UserComplianceCheckPassFailEmailDAO
  extends ProxyDAO
  {

  public UserComplianceCheckPassFailEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

    @Override
    public FObject put_(X x, FObject obj) {
      Logger logger = (Logger) getX().get("logger");

      // Checks if User exists.
      User user = (User) obj;
      if ( user == null || user.getId() == 0 )
        return getDelegate().put_(x, obj);

      // Checks if User has existed which is really just a duplicate check of user.getId() == 0, or at least it should.
      User oldUser = (User) getDelegate().find(user.getId());
      if ( oldUser == null || oldUser.getId() == 0 )
        return getDelegate().put_(x, obj);

      // Make sure to only send on complaince status change from PASSED. FAILED will take a different route, currently undefined requirements
      if ( ! (ComplianceStatus.REQUESTED == oldUser.getCompliance()) || ! (ComplianceStatus.PASSED == user.getCompliance()) )
        return getDelegate().put_(x, obj);

      if ( ! user.getEmailVerified() ) {
        logger.error(String.format("user(id=%1$d) has had Compliance status changed to %2$s  but is unable to be notified due to user's email is not yet verified.", user.getId(), user.getCompliance()));
        return getDelegate().put_(x, obj);
      }

      user = (User) getDelegate().put_(x , obj);
      EmailService            email        = (EmailService) x.get("email");
      EmailMessage            message      = new EmailMessage();
      Map<String, Object> args         = new HashMap<>();

      message.setTo(new String[]{user.getEmail()});
      args.put("business",        user.label());
      args.put("statusUpdate",   "PASSED all checks!");

      try {
        email.sendEmailFromTemplate(x, user, message, "compliance-notification-to-user", args);
      } catch (Exception e) {
        logger.error("Error sending compliance-notification-to-user email.", e);
      }

      return user;
  }
}
