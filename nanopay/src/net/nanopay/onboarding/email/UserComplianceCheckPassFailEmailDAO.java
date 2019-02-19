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

      // Make sure to only send on complaince status change from PASSED or FAILED
      if ( ! ComplianceStatus.REQUESTED.equals(oldUser.getCompliance()) ||
       ! ( ComplianceStatus.PASSED.equals(user.getCompliance()) || ComplianceStatus.FAILED.equals(user.getCompliance()) ) )
        return getDelegate().put_(x, obj);

      if ( ! user.getEmailVerified() )
        logger.error("user(id=" + user.getId() + ") has had Compliance status changed to " + user.getCompliance() + " but is unable to be notified due to user's email is not yet verified.");

      user = (User) getDelegate().put_(x , obj);
      EmailService            email        = (EmailService) x.get("email");
      EmailMessage            message      = new EmailMessage();
      HashMap<String, Object> args         = new HashMap<>();

      message.setTo(new String[]{user.getEmail()});
      args.put("business",        user.label());
      args.put("statusUpdate",    (ComplianceStatus.PASSED.equals(user.getCompliance()) ? "PASSED all checks!" : "unfortunately not passed all checks"));

      try {
        email.sendEmailFromTemplate(x, user, message, "compliance-Notification-to-user", args);
      } catch (Exception e) {
        logger.error("Error sending compliance-Notification-to-user email.", e);
      }

      return user;
  }
}
