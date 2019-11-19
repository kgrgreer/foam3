foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBankUploadingRule2',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Uploads bank information to AFEX when a new account is added to a business that is already onboarded on AFEX.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Business',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.INSTANCE_OF',
    'java.util.List'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof BankAccount && (oldObj == null || ((BankAccount)oldObj).getStatus() == BankAccountStatus.UNVERIFIED)) ) {
              return;
            }
            BankAccount account = (BankAccount) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            AFEXBusiness afexBusiness = afexServiceProvider.getAFEXBusiness(x, account.getOwner());

            if ( afexBusiness == null ) {
              return;
            }
            DAO businessDAO = (DAO) x.get("businessDAO");
            Business business = (Business) businessDAO.find(account.getOwner());

            if ( ! afexServiceProvider.directDebitEnrollment(business, account) ) {
              EmailMessage message = new EmailMessage();
              String body = "Failed to upload bank account: " + account.getId() + ", for AFEX business " + business.getBusinessName() + " " + business.getId();
              message.setTo(new String[]{"paymentops@nanopay.net"});
              message.setSubject("Failed AFEX Bank Account Upload");
              message.setBody(body);
              EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
            }
          }
        }, "Uploads business'a bank accounts to AFEX if the business has passed comliance.");
      `
    }
  ]
 });
