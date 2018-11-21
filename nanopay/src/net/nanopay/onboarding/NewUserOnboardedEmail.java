package net.nanopay.onboarding;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.admin.model.AccountStatus;

import java.util.Iterator;
import java.util.List;

import static foam.mlang.MLang.EQ;

public class NewUserOnboardedEmail implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO dao = (DAO) x.get("localUserDAO");
    Sink sink = new ArraySink();

    // TODO: filter for new onboarded users excluding the users already sent in previous email
    sink = dao.where(
      EQ(User.STATUS, AccountStatus.SUBMITTED)).select(sink);

    List data = ((ArraySink) sink).getArray();
    int newUserCount = 0;

    // TODO: maybe use ThreadLocal<StringBuilder>
    StringBuilder sb = new StringBuilder();

    // TODO: use html for body content
    sb.append("List of new user(s) on boarded:\n");
    Iterator i = data.iterator();
    while ( i.hasNext() ) {
      try {
        User user = (User) i.next();
        newUserCount += 1;
        sb.append("\n\t")
          .append(user.getEmail())
          .append(" - ")
          .append(user.getLegalName());
      } catch ( Throwable ignored ) { }
    }

    // Only send an email if there is new users onboarded
    if (newUserCount > 0) {
      EmailService emailService = (EmailService) x.get("email");
      EmailMessage message      = new EmailMessage();

      message.setTo(new String[] { "enrollement@nanopay.net" });
      message.setBcc(new String[] { "chanmann@nanopay.net" });
      message.setSubject(newUserCount + " New User(s) Onboarded");
      message.setBody(sb.toString());
      emailService.sendEmail(x, message);
    }
  }
}
