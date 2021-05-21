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
  name: 'AFEXBankUpdatingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Uploads bank information to AFEX when a bankaccount is updated for a business that is already onboarded on AFEX.`,

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
                if ( ! afexServiceProvider.directDebitUnenrollment(business, account) ) {
                  sendFailureEmail(x, String.valueOf(account.getId()), String.valueOf(afexUser.getUser()), business, "Failed to upload bank account, unenrollment failed: ");
                }

                if ( ! afexServiceProvider.directDebitEnrollment(business, account) ) {
                  sendFailureEmail(x, String.valueOf(account.getId()), String.valueOf(afexUser.getUser()), business, "Failed to upload bank account: ");
                }
              } catch (Exception e) {
                ((Logger) x.get("logger")).error("Error updating bank account on AFEX", account, e);
                sendFailureEmail(x, String.valueOf(account.getId()), String.valueOf(afexUser.getUser()), business, "Failed to upload bank account, : ");
              }
            }
          }
        }, "Uploads bank information to AFEX when a bankaccount is updated for a business that is already onboarded on AFEX.");
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
        },
        {
          type: 'String',
          name: 'message'
        },
      ],
      javaCode: `
        EmailMessage emailMessage = new EmailMessage();
        String businessInfo = business == null ? "" : business.getId() + " " + business.getBusinessName();
        String body = message + account + ", for AFEX business " + afexUser + ", business: " + businessInfo;
        emailMessage.setTo(new String[]{"enrollment@ablii.com"});
        emailMessage.setSubject("Failed AFEX Bank Account Upload");
        emailMessage.setBody(body);
        EmailsUtility.sendEmailFromTemplate(x, null, emailMessage, null, null);
      `
    }
  ]
 });
