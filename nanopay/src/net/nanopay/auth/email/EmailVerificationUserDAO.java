package net.nanopay.auth.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;

import java.util.HashMap;

public class EmailVerificationUserDAO
    extends ProxyDAO
{
  public EmailVerificationUserDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;
    Count count = new Count();
    EmailService email = (EmailService) x.get("email");
    EmailTokenService emailToken = (EmailTokenService) x.get("emailToken");

    count = (Count) getDelegate().where(MLang.EQ(User.EMAIL, user.getEmail()))
        .limit(1).select(count);

    // send email
    if ( count.getValue() == 0 ) {
      EmailMessage message = new EmailMessage();
      message.setFrom("info@nanopay.net");
      message.setReplyTo("noreply@nanopay.net");
      message.setTo(new String[] { user.getEmail() });
      message.setSubject("MintChip email verification");

      HashMap<String, Object> args = new HashMap<>();
      args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
      args.put("link", "http://localhost:8080/verifyEmail?token=" + emailToken.generateToken(user));

      email.sendEmailFromTemplate(message, "welcome-mintchip", args);
    }

    return super.put_(x, obj);
  }
}