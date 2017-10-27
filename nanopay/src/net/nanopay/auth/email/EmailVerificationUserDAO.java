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
    User result = (User) super.put_(x, obj);
    if ( count.getValue() == 0 ) {
      emailToken.generateToken(result);
    }

    return result;
  }
}