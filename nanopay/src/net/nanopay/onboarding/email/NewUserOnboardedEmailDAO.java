package net.nanopay.onboarding.email;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.mlang.sink.Count;
import net.nanopay.account.Account;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

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
        .append("User: LegalName = " + newUser.getLegalName())
        .append(" - ")
        .append("Email = " + newUser.getEmail())
        .append(" - ")
        .append("Company = " + newUser.getOrganization())
        .append("</li></ul>");
      
      // For the purpose of sending an email once both onboarding and bank account added
      // Gather info
      ArraySink count = (ArraySink) newUser.getAccounts(x).where(AND(EQ(Account.TYPE, "BankAccount"), EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED))).select(new ArraySink());
      // checking if account has been added
      if ( count.getArray() != null && count.getArray().size() != 0 ) {
        // User also has bankAccount, thus add bank fields to email
        builder.append("<br><p>User also has a bankAccount:<p>")
        .append("<ul><li>")
        .append("Bank Account: Currency/Denomination = " + ( (BankAccount) count.getArray().get(0) ).getDenomination())
        .append(" - ")
        .append("Bank Account Name = " + ( (BankAccount) count.getArray().get(0) ).getName())
        .append(" - ")
        .append("Bank Account id = " + ( (BankAccount) count.getArray().get(0) ).getId())
        .append("</li></ul>");
      }

      message.setTo(new String[] { "anna@nanopay.net" });
      message.setSubject("New User Onboarded");
      message.setBody(builder.toString());
      emailService.sendEmail(x, message);
    }

    return super.put_(x, obj);
  }
}
