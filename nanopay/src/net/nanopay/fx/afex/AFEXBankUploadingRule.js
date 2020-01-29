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
            if ( ! (obj instanceof Business) ) {
              return;
            }
            Business business = (Business) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            DAO afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
            AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
            if ( afexBusiness != null ) return;
            DAO accountDAO = (DAO) x.get("localAccountDAO");
            ArraySink accountSink = new ArraySink();
            accountDAO.where(AND(
              EQ(Account.OWNER, business.getId()),
              INSTANCE_OF(BankAccount.getOwnClassInfo())
            )).select(accountSink);
            List<BankAccount> accountList = accountSink.getArray();
            for ( BankAccount account: accountList) {
              if ( ! afexServiceProvider.directDebitEnrollment(business, account) ) {
                EmailMessage message = new EmailMessage();
                String body = "Failed to upload bank account: " + account.getId() + ", for AFEX business " + business.getBusinessName() + " " + business.getId();
                message.setTo(new String[]{"paymentops@nanopay.net"});
                message.setSubject("Failed AFEX Bank Account Upload");
                message.setBody(body);
                EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
              }
            }
          }
        }, "Uploads business'a bank accounts to AFEX if the business has passed comliance.");
      `
    }
  ]
 });
