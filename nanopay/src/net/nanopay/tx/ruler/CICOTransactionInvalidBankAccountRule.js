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
  name: 'CICOTransactionInvalidBankAccountRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to set the bank account to unverified if it wasn't verified by a trust agent, 
                  if it is an external contact, then remove bank account`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'java.util.HashMap',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO accountDAO = (DAO) x.get("accountDAO");
          Transaction txn = (Transaction) obj;
          DAO institutionDAO = (DAO) x.get("institutionDAO");
          if ( obj instanceof CITransaction ) {
            BankAccount sourceAccount = (BankAccount) ((Transaction)obj).findSourceAccount(x);
            Boolean sourceUnverified = SafetyUtil.isEmpty(sourceAccount.getVerifiedBy());
            if ( sourceUnverified ) {
              sourceAccount = (BankAccount) sourceAccount.fclone();
              sourceAccount.setStatus(BankAccountStatus.UNVERIFIED);
              accountDAO.put(sourceAccount);
  
              User sourceAccountOwner = (User) sourceAccount.findOwner(x);
              AppConfig sourceConfig = sourceAccountOwner.findGroup(x).getAppConfig(x);
              Institution sourceAccountInstitution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER,sourceAccount.getInstitutionNumber()));
              String sourceAccountInstitutionName = sourceAccountInstitution == null ? null : sourceAccountInstitution.toSummary();
  
              HashMap<String, Object> sourceArgs = new HashMap<>();
              sourceArgs.put("contactBusiness", txn.getPayee());
              sourceArgs.put("name", sourceAccountOwner.FIRST_NAME);
              sourceArgs.put("institutionNumber", sourceAccount.getInstitutionNumber());
              sourceArgs.put("institutionName", sourceAccountInstitutionName);
              sourceArgs.put("accountNumber", BankAccount.mask(sourceAccount.getAccountNumber()));
              sourceArgs.put("userEmail", sourceAccountOwner.EMAIL);
              sourceArgs.put("sendTo", sourceAccountOwner.EMAIL);
              sourceArgs.put("link", sourceConfig.getUrl());
  
              Notification sourceAccountEditNotification = new Notification.Builder(x)
              .setBody(sourceAccount.getAccountNumber() + " verification failed!")
              .setNotificationType("bankNotifications")
              .setEmailName("edit-bank-account")
              .setEmailArgs(sourceArgs)
              .build();
              sourceAccountOwner.doNotify(x, sourceAccountEditNotification);
            };
          }
          if ( obj instanceof COTransaction ) {
            BankAccount destinationAccount = (BankAccount) ((Transaction)obj).findDestinationAccount(x);
            Boolean destinationUnverified = SafetyUtil.isEmpty(destinationAccount.getVerifiedBy());
            if ( destinationUnverified ) {
              //check if it is a contact bank account
              if ( destinationAccount.getOwner() == destinationAccount.getCreatedBy() ) {
                destinationAccount = (BankAccount) destinationAccount.fclone();
                destinationAccount.setStatus(BankAccountStatus.UNVERIFIED);
                accountDAO.put(destinationAccount);
    
                User destinationAccountOwner = (User) destinationAccount.findOwner(x);
                AppConfig destinationConfig = destinationAccountOwner.findGroup(x).getAppConfig(x);
                Institution destinationAccountInstitution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER,destinationAccount.getInstitutionNumber()));
                String destinationAccountInstitutionName = destinationAccountInstitution == null ? null : destinationAccountInstitution.toSummary();
    
                HashMap<String, Object> destinationArgs = new HashMap<>();
                destinationArgs.put("contactBusiness", txn.getPayer());
                destinationArgs.put("name", 
                  destinationAccountOwner.getOrganization() != null ? 
                    destinationAccountOwner.getOrganization() : 
                    destinationAccountOwner.getBusinessName()
                );
                destinationArgs.put("institutionNumber", destinationAccount.getInstitutionNumber());
                destinationArgs.put("institutionName", destinationAccountInstitutionName);
                destinationArgs.put("accountNumber", BankAccount.mask(destinationAccount.getAccountNumber()));
                destinationArgs.put("userEmail", destinationAccountOwner.EMAIL);
                destinationArgs.put("sendTo", destinationAccountOwner.EMAIL);
                destinationArgs.put("link", destinationConfig.getUrl());
    
                Notification destinationAccountEditNotification = new Notification.Builder(x)
                .setBody(destinationAccount.getAccountNumber() + " verification failed!")
                .setNotificationType("bankNotifications")
                .setEmailName("edit-bank-account")
                .setEmailArgs(destinationArgs)
                .build();
                destinationAccountOwner.doNotify(x, destinationAccountEditNotification);
              } else {
                //remove invaild bank account for external contact
                DAO transactionDAO = (DAO) x.get("localTransactionDAO");
                ArraySink txnSink = new ArraySink();
                transactionDAO.where(
                  AND(
                    OR(
                      EQ(Transaction.DESTINATION_ACCOUNT, destinationAccount.getId()),
                      EQ(Transaction.SOURCE_ACCOUNT, destinationAccount.getId())
                    ),
                    OR(
                      INSTANCE_OF(COTransaction.class),
                      INSTANCE_OF(CITransaction.class)
                    ),
                    EQ(Transaction.STATUS, TransactionStatus.COMPLETED)
                  )
                ).select(txnSink);
                List<Transaction> txns = txnSink.getArray();
                if ( txns.size() == 0 ) {
                  Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER,destinationAccount.getInstitutionNumber()));
                  User user = (User) destinationAccount.findCreatedBy(x);
                  User contact = (User) destinationAccount.findOwner(x);
                  AppConfig config = user.findGroup(x).getAppConfig(x);
                  String institutionName = institution == null ? null : institution.toSummary();
                  HashMap<String, Object> args = new HashMap<>();
                  args.put("name", User.FIRST_NAME);
                  args.put("contactBusiness", contact.getOrganization());
                  args.put("institutionNumber", destinationAccount.getInstitutionNumber());
                  args.put("institutionName", institutionName);
                  args.put("accountNumber", BankAccount.mask(destinationAccount.getAccountNumber()));
                  args.put("userEmail", User.EMAIL);
                  args.put("sendTo", User.EMAIL);
                  args.put("link", config.getUrl());
                  Notification notification = new Notification.Builder(x)
                  .setBody(destinationAccount.getAccountNumber() + " verification failed!")
                  .setNotificationType("bankNotifications")
                  .setEmailName("contact-bank-add-failed")
                  .setEmailArgs(args)
                  .build();
                  accountDAO.remove(destinationAccount);
                  user.doNotify(x, notification);
                }
              }
            }
          }
        }
      }, "Rule to set bank account back to unverified if it isn't verified by a trust agent, remove account if it is an external bank account");
  `
    }
  ]
});
