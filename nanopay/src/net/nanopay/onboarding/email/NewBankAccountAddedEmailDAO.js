foam.CLASS({
  package: 'net.nanopay.onboarding.email',
  name: 'NewBankAccountAddedEmailDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for sending email notification to enrollment-team@nanopay.net
      when user has verified this bankAccount. If user has just verified this bankAccount, decorator 
      is also checking if the business registration has been completed, if so that fact is also 
      included in this email.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Business',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      // Testing if passing obj is a BankAccount and is a new BankAccount
      if ( ! ( obj instanceof BankAccount ) ) {
        return getDelegate().put_(x, obj);
      }
      // Wrapping obj to be recognized as BankAccount obj.
      BankAccount account    = (BankAccount) obj;
  
      // Check 1: Don't send email if account is not enabled
      if ( ! account.getEnabled() ) {
        return getDelegate().put_(x, obj);
      }
  
      // Check 2: Don't send email if account was deleted
      if ( account.getDeleted() ) {
        return getDelegate().put_(x, obj);
      }
  
      // Gathering additional information
      BankAccount oldAccount = (BankAccount) find_(x, account.getId());
  
      // Check 3: Don't send email if account has not changed status
      if ( oldAccount != null && oldAccount.getStatus() == account.getStatus() ) {
        return getDelegate().put_(x, obj);
      }
  
      // Gathering additional information
      User owner = (User) account.findOwner(getX());

      // Check 4: Confirm correct Bank Account properties set
      if ( owner == null ) {
        String msg = String.format("Email meant for complaince team Error - account owner was null: Account name = %1$s", account.getName());
        ((Logger) x.get("logger")).error(this.getClass().getSimpleName(), msg);
        return getDelegate().put_(x, obj);
      } 

      // finish processing the account through the dao
      account = (BankAccount) getDelegate().put_(x, obj);

      // Send email only after passing above checks
      EmailMessage message = new EmailMessage.Builder(x).build();
      Map<String, Object>  args = new HashMap<>();

      args.put("userId", owner.getId());
      args.put("userEmail", owner.getEmail());
      args.put("userCo", owner.getOrganization());
      args.put("subTitle2", "BankAccount Information:");
      args.put("accDen", account.getDenomination());
      args.put("accName", account.getName());
      args.put("accId", account.getId());

      if ( owner instanceof Business &&  ((Business) owner).getOnboarded() ) {
        args.put("title", "User added a (" + account.getStatus() + ") Account & was previously onboarded");
        args.put("subTitle1", "User(Account Owner) information: ONBOARDED");
      } else {
        args.put("title", "User has added a (" + account.getStatus() + ") Bank Account");
        args.put("subTitle1", "User(Account Owner) information: NOT ONBOARDED YET");
      }

      try {
        EmailsUtility.sendEmailFromTemplate(x, owner, message, "notification-to-onboarding-team", args);
      } catch (Throwable t) {
        String msg = String.format("Email meant for complaince team Error: User (id = %1$s) has added a BankAccount (id = %2$d).", owner.getId(), account.getId());
        ((Logger) x.get("logger")).error(msg, t);
      }
      
      return account;
      `
    }
  ]
});
