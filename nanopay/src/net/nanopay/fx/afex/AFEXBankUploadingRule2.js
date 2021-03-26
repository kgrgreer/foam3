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
  name: 'AFEXBankUploadingRule2',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Uploads bank information to AFEX when a new account is added to a business that is already onboarded on AFEX.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.logger.Logger',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            BankAccount account = (BankAccount) obj;
            User user = (User) account.findOwner(x);

            if ( user instanceof Business ) {
              Business business = (Business) user;
              AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
              AFEXUser afexUser = afexServiceProvider.getAFEXUser(x, account.getOwner());

              try {
                if ( ! afexServiceProvider.directDebitEnrollment(business, account) ) {
                  sendFailureEmail(x, String.valueOf(account.getId()), String.valueOf(afexUser.getUser()), business);
                }
              } catch (Exception e) {
                ((Logger) x.get("logger")).error("Error uploading bank account on AFEX", account, e);
                sendFailureEmail(x, String.valueOf(account.getId()), String.valueOf(afexUser.getUser()), business);
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
          type: 'String',
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
        String body = "Failed to upload bank account: " + account + ", for AFEX business " + afexUser + ", business: " + businessInfo;
        message.setTo(new String[]{"enrollment@ablii.com"});
        message.setSubject("Failed AFEX Bank Account Upload");
        message.setBody(body);
        EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
      `
    }
  ]
 });
