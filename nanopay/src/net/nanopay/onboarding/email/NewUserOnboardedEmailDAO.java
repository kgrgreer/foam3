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
import net.nanopay.account.Account;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;

import java.util.List;

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

    // Send email only when user property onboarded is changed from false to true
    if ( oldUser != null && ! oldUser.getOnboarded() && newUser.getOnboarded() )
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
      ArraySink arraySink = (ArraySink) newUser.getAccounts(x).select(new ArraySink());
      List accountsArray =  arraySink.getArray();
      Boolean doesAccExist = false;
      Account acc = null;
      if ( accountsArray != null && accountsArray.size() > 0 ) {
        for (int i =0; i < accountsArray.size(); i++) { 
          acc = (Account) accountsArray.get(i);
          if ( acc.getType().contains("BankAccount")  && ((BankAccount)acc).getStatus() == BankAccountStatus.VERIFIED ) {
            doesAccExist = true;
            break;
          }
        }
      }
      // checking if account has been added
      if ( doesAccExist ) {
        // User also has bankAccount, thus add bank fields to email
        builder.append("<br><p>User also has a bankAccount:<p>")
        .append("<ul><li>")
        .append("Bank Account: Currency/Denomination = " + ((BankAccount) acc).getDenomination())
        .append(" - ")
        .append("Bank Account Name = " + ((BankAccount) acc).getName())
        .append(" - ")
        .append("Bank Account id = " + ((BankAccount) acc).getId())
        .append("</li></ul>");
      } else {
        builder.append("<br><p>Above user does not have a verified bankAccount yet<p>");
      }

      message.setTo(new String[] { "enrollment-team@nanopay.net" });
      message.setSubject("New User Onboarded");
      message.setBody(builder.toString());
      emailService.sendEmail(x, message);
    }

    return super.put_(x, obj);
  }
}
