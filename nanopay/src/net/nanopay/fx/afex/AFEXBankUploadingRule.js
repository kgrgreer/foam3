/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
            AFEXUser afexUser = (AFEXUser) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            DAO businessDAO = (DAO) x.get("businessDAO");
            Business business = (Business) businessDAO.find(EQ(Business.ID, afexUser.getUser()));
            if ( business == null ) {
              sendFailureEmail(x, "All account", afexUser, null);
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
                sendFailureEmail(x, String.valueOf(account.getId()), afexUser, business);
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
          type: 'AFEXUser',
          name: 'afexUser'
        },
        {
          type: 'Business',
          name: 'business'
        }
      ],
      javaCode: `
        EmailMessage message = new EmailMessage();
        String businessInfo = business == null ? "" : business.getId() + " " + business.getBusinessName();
        String body = "Failed to upload bank account: " + account + ", for AFEX business " + afexUser.getId() + ", business: " + businessInfo;
        message.setTo(new String[]{"enrollment@ablii.com"});
        message.setSubject("Failed AFEX Bank Account Upload");
        message.setBody(body);
        EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
      `
    }
  ]
 });
