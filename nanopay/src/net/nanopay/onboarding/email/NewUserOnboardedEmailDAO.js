foam.CLASS({
  package: 'net.nanopay.onboarding.email',
  name: 'NewUserOnboardedEmailDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for sending email notification to enrollment-team@nanopay.net
      when user has finished the onboarding process (BusinessRegistrationWizard). 
      If user has passed the business registration we are also checking if the user has a bank account. 
      If so that fact is also included in this email.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        // Send email only when user property onboarded is changed from false to true
        if ( oldUser != null && ! oldUser.getOnboarded() && newUser.getOnboarded() ) {
          EmailService emailService = (EmailService) x.get("email");
          EmailMessage message = new EmailMessage();

          StringBuilder sb = new StringBuilder();
          
          // Writing out the main onboarding email body.
          sb.append("<p>New user onboarded:<p>")
            .append("<ul><li>")
            .append("User: Id = " + newUser.getId() )
            .append(" - ")
            .append("Email = " + newUser.getEmail())
            .append(" - ")
            .append("Company = " + newUser.getOrganization())
            .append("</li></ul>");

          // For the purpose of sending an email once both onboarding and bank account added
          List accountsArray = ((ArraySink) newUser.getAccounts(x).where(
            MLang.AND(
              MLang.INSTANCE_OF(BankAccount.class),
              MLang.EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED))
            )
            .limit(1).select(new ArraySink())).getArray();

          Boolean doesAccExist = (accountsArray != null && accountsArray.size() > 0);
          Account acc = (Account)(doesAccExist ? accountsArray.get(0) : null);

          // checking if account has been added
          if ( doesAccExist ) {
            // User also has bankAccount, thus add bank fields to email
            sb.append("<br><p>User also has a bankAccount:<p>")
            .append("<ul><li>")
            .append("Bank Account: Currency/Denomination = " + ((BankAccount) acc).getDenomination())
            .append(" - ")
            .append("Bank Account Name = " + ((BankAccount) acc).getName())
            .append(" - ")
            .append("Bank Account id = " + ((BankAccount) acc).getId())
            .append("</li></ul>");
          } else {
            sb.append("<br><p>Above user does not have a verified bankAccount yet<p>");
          }
          
          try {
            message.setTo(new String[] { "anna@nanopay.net" });
            message.setSubject("New User Onboarded");
            message.setBody(sb.toString());
            emailService.sendEmail(x, message);
          } catch (Throwable t) {
            String msg = String.format("Email meant for complaince team Error: User (id = %1$s) has finished onboarding.", newUser.getId());
            ((Logger) x.get("logger")).error(msg, t);
          }
        }

        return getDelegate().put_(x, obj);
      `
    }
  ]
});
