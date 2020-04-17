foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBankUploadingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Uploads bank information to AFEX when a business's compliance is passed.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
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
            AFEXBusiness afexBusiness = (AFEXBusiness) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            DAO businessDAO = (DAO) x.get("businessDAO");
            Business business = (Business) businessDAO.find(EQ(Business.ID, afexBusiness.getUser()));
            if ( business == null ) {
              sendFailureEmail(x, "All account", afexBusiness, null);
              return;
            }
            DAO accountDAO = (DAO) x.get("localAccountDAO");
            ArraySink accountSink = new ArraySink();
            accountDAO.where(AND(
              EQ(Account.OWNER, business.getId()),
              INSTANCE_OF(BankAccount.getOwnClassInfo())
            )).select(accountSink);
            List<BankAccount> accountList = accountSink.getArray();
            for ( BankAccount account: accountList) {
              if ( ! afexServiceProvider.directDebitEnrollment(business, account) ) {
                sendFailureEmail(x, String.valueOf(account.getId()), afexBusiness, business);
              }
            }
          }
        }, "Uploads business'a bank accounts to AFEX if the business has passed comliance.");
      `
    },
    {
      name: 'sendFailureEmail',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'String',
          name: 'account'
        },
        {
          type: 'AFEXBusiness',
          name: 'afexBusiness'
        },
        {
          type: 'Business',
          name: 'business'
        }
      ],
      javaCode: `
        EmailMessage message = new EmailMessage();
        String businessInfo = business == null ? "" : business.getId() + " " + business.getBusinessName();
        String body = "Failed to upload bank account: " + account + ", for AFEX business " + afexBusiness.getId() + ", business: " + businessInfo;
        message.setTo(new String[]{"paymentops@nanopay.net"});
        message.setSubject("Failed AFEX Bank Account Upload");
        message.setBody(body);
        EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
      `
    }
  ]
 });
