package net.nanopay.onboarding.email;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.admin.model.AccountStatus;

public class NewUserOnboardedEmailDAO extends ProxyDAO {
  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public NewUserOnboardedEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User newUser = (User) obj;
    User oldUser = (User) getDelegate().find(newUser.getId());
    PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("onboarded");

    // Send email only when user property onboarded is changed from false to true
    if ( oldUser != null && ! ((Boolean)prop.get(oldUser)) && ((Boolean)prop.get(newUser)) )
    {
      EmailService emailService = (EmailService) x.get("email");
      EmailMessage message = new EmailMessage();
      StringBuilder builder = sb.get()
        .append("<p>New user onboarded:<p>")
        .append("<ul><li>")
        .append(newUser.getLegalName())
        .append(" - ")
        .append(newUser.getEmail())
        .append("</li></ul>");

      message.setTo(new String[] { "enrollment-team@nanopay.net" });
      message.setSubject("New User Onboarded");
      message.setBody(builder.toString());
      emailService.sendEmail(x, message);
    }

    return super.put_(x, obj);
  }
}
