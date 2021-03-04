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
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'java.util.HashMap',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.ruler.AccountAddedNotification',
    'net.nanopay.contacts.PersonalContact',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution'
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
            if( account.findOwner(x) instanceof PersonalContact ) return;

            String      accountNumber   = BankAccount.mask(account.getAccountNumber());
            User        owner           = (User) userDAO.find(account.getOwner());
            Group       group           = owner.findGroup(x);
            AppConfig   config          = group != null ? (AppConfig) group.getAppConfig(x) : (AppConfig) x.get("appConfig");

            HashMap<String, Object> args = new HashMap<>();
            args.put("name",    User.FIRST_NAME);
            args.put("sendTo",  User.EMAIL);
            args.put("account", accountNumber);
            args.put("link",    config.getUrl());
            args.put("business", owner.getOrganization());

            AccountAddedNotification addedNotification = new AccountAddedNotification.Builder(x)
                    .setAccountNumber(accountNumber)
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
