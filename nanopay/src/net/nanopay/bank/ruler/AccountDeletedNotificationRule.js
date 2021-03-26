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
  name: 'AccountDeletedNotificationRule',

  documentation: 'Send notification to account owner when bank account has been deleted.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'java.util.HashMap',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.PersonalContact',
    'net.nanopay.payment.Institution',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! ( obj instanceof BankAccount ) ) return;
            DAO                 userDAO = (DAO) x.get("userDAO");
            DAO          institutionDAO = (DAO) x.get("institutionDAO");

            BankAccount         account = (BankAccount) obj;
            User                  owner = (User) userDAO.find(account.getOwner());
            Group                 group = owner.findGroup(x);
            AppConfig            config = group != null ? (AppConfig) group.getAppConfig(x) : null;
            Institution     institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER,account.getInstitutionNumber()));

            if ( config == null ) return;
            if ( owner instanceof PersonalContact ) return;

            HashMap<String, Object> args = new HashMap<>();
            args.put("link",    config.getUrl());
            args.put("name",    User.FIRST_NAME);
            args.put("account", BankAccount.mask(account.getAccountNumber()));
            args.put("institutionNumber", account.getInstitutionNumber());
            args.put("institutionName", institution == null ? null : institution.toSummary());
            args.put("business", owner.toSummary());

            Notification deletedNotification = new Notification.Builder(x)
                    .setBody(account.getName() + " has been deleted.")
                    .setNotificationType("Latest_Activity")
                    .setEmailArgs(args)
                    .setEmailName("deletedBank")
                    .build();

            owner.doNotify(x, deletedNotification);
          }
        }, "Send notification to account owner when account has been deleted.");
      `
    }
  ]
});
