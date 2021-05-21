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
  package: 'net.nanopay.tx.ruler',
  name: 'MicroDepositFailed',

  documentation: `Send email when micro deposit from bank account verification fails`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.cico.VerificationTransaction',
    'java.util.HashMap',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
          @Override
           public void execute(X x) {
            String institutionName;
            VerificationTransaction txn = (VerificationTransaction) obj;
            DAO accountDAO = (DAO) x.get("accountDAO");
            DAO institutionDAO = (DAO) x.get("institutionDAO");
            Logger logger = (Logger) x.get("logger");
            BankAccount acc = (BankAccount) accountDAO.find(EQ(Account.ID, txn.getDestinationAccount()));
            Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER,acc.getInstitutionNumber()));
            User user = (User) acc.findOwner(x);
            AppConfig config = user.findGroup(x).getAppConfig(x);

            institutionName = institution == null ? null : institution.toSummary();

            HashMap<String, Object> args = new HashMap<>();
            args.put("name", User.FIRST_NAME);
            args.put("institutionNumber", acc.getInstitutionNumber());
            args.put("institutionName", institutionName);
            args.put("accountNumber", BankAccount.mask(acc.getAccountNumber()));
            args.put("userEmail", User.EMAIL);
            args.put("sendTo", User.EMAIL);
            args.put("link", config.getUrl());

            Notification notification = new Notification.Builder(x)
            .setBody(acc.getAccountNumber() + " verification failed!")
            .setNotificationType("bankNotifications")
            .setEmailName("micro-deposit-failed")
            .setEmailArgs(args)
            .build();
            user.doNotify(x, notification);
          }
      }, "send notification");
      `
    }
  ]
});
