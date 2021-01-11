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
  package: 'net.nanopay.bank.ruler',
  name: 'AccountAddedNotificationRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Sends notifications to account owner detailing that their bank account has been added to the system.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.notification.Notification',
    'java.util.HashMap',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution'
  ],

  messages: [
    { name: 'NOTIFICATION_BODY_P1', message: ' has been added!'}
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userDAO = (DAO) x.get("userDAO");
            BankAccount account = (BankAccount) obj;
            //If bank account added using void check, don't send (micro-deposit-sent email gets sent instead).
            if( account.getRandomDepositAmount() != 0) return;
            if( account.findOwner(x) instanceof Contact ) return;
            User owner = (User) userDAO.find(account.getOwner());
            Group       group      = owner.findGroup(x);
            AppConfig   config     = group != null ? (AppConfig) group.getAppConfig(x) : (AppConfig) x.get("appConfig");
            String accountNumber   = account.getAccountNumber() != null ? account.obfuscate(account.getAccountNumber(), 1, account.getAccountNumber().length() - 4) : "";

            HashMap<String, Object> args = new HashMap<>();
            args.put("name",    User.FIRST_NAME);
            args.put("sendTo",  User.EMAIL);
            args.put("account", accountNumber);
            args.put("link",    config.getUrl());
            args.put("business", owner.getOrganization());

            TranslationService ts = (TranslationService) x.get("translationService");
            Subject subject = (Subject) x.get("subject");
            String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
            String notificationP1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P1", NOTIFICATION_BODY_P1);

            Notification addedNotification = new Notification.Builder(x)
                    .setBody(accountNumber + notificationP1)
                    .setNotificationType("Latest_Activity")
                    .setEmailArgs(args)
                    .setEmailName("addBank")
                    .build();
            owner.doNotify(x, addedNotification);
          }
        }, "Sends notifications to account owner detailing that their bank account has been added to the system.");
      `
    }
  ]
 });
