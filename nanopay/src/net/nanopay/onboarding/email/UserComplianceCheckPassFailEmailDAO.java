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
      // Checks if User exists.
      User user = (User) obj;
      if ( user == null || user.getId() ==0 )
        return getDelegate().put_(x, obj);

      User oldUser = (User) getDelegate().find(user.getId());

      // Make sure to only send on complaince status change from PASSED or FAILED
      if ( ! ComplianceStatus.REQUESTED.equals(oldUser.getCompliance()) &&
       ! ( ComplianceStatus.PASSED.equals(user.getCompliance()) || ComplianceStatus.FAILED.equals(user.getCompliance()) ) )
        return getDelegate().put_(x, obj);

      user = (User) super.put_(x , obj);
      // user sending the email
      // User                    admin        = (User) getDelegate().find(user.getInvitedBy());
      
      EmailService            email        = (EmailService) x.get("email");
      EmailMessage            message      = new EmailMessage();
      HashMap<String, Object> args         = new HashMap<>();

      message.setTo(new String[]{user.getEmail()});
      args.put("business",        user.label());
      args.put("statusUpdate",    (ComplianceStatus.PASSED.equals(user.getCompliance()) ? "PASSED all checks!" : "unfortately not passed all checks"));

      try {
        email.sendEmailFromTemplate(x, user, message, "compliance-Notification-to-user", args);
      } catch (Throwable t) {
        (x.get(Logger.class)).error("Error sending compliance-Notification-to-user email.", t);
      }

      return user;
  }
}
