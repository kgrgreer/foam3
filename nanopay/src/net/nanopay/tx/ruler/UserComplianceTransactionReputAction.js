
/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'UserComplianceTransactionReputAction',

  documentation: 'Checks whether compliance has been updated for a user and reputs any associated UserComplianceTransactions.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.X',
    'foam.core.ContextAgent',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.ruler.exceptions.TransactionValidationException',
    'net.nanopay.tx.UserComplianceTransaction',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;

        if ( user.getCompliance() != ComplianceStatus.PASSED &&
             user.getCompliance() != ComplianceStatus.FAILED )
             return;

        DAO accountDAO = (DAO) x.get("localAccountDAO");
        var ownedAccounts = ((ArraySink) accountDAO.where(EQ(Account.OWNER, user.getId())).select(new ArraySink())).getArray();
        if ( ownedAccounts.size() <= 0 ) return;

        getLogger(x).debug("Found " + ownedAccounts.size() + " owned accounts for user " + user.getId() + " - " + user.getCompliance());

        List<Transaction> transactions = new ArrayList<Transaction>();
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        for ( var account : ownedAccounts ) {
          Account ownedAccount = (Account) account;
          var txns = ((ArraySink) transactionDAO.where(AND(
            EQ(Transaction.STATUS, TransactionStatus.PENDING),
            OR(
              EQ(Transaction.SOURCE_ACCOUNT, ownedAccount.getId()),
              EQ(Transaction.DESTINATION_ACCOUNT, ownedAccount.getId())),
            INSTANCE_OF(UserComplianceTransaction.class)
          )).select(new ArraySink())).getArray();
          if ( txns.size() <= 0 ) continue;

          // Add to list
          transactions.addAll(txns);
        }

        // Check if there are any transactions to resubmit
        if ( transactions.size() <= 0 ) return;
        
        // Reput all UserComplianceTransactions
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            getLogger(x).debug("Reputting " + transactions.size() + " transactions");
            for ( var transaction : transactions ) {
              try
              {
                User user = transaction.findCreatedBy(x);
                User agent = transaction.findCreatedByAgent(x);

                Subject subject = null;
                if ( agent != null && agent.getId() != user.getId() ) {
                  subject = new Subject.Builder(x).setUser(agent).build();
                  subject.setUser(user);
                } else {
                  subject = new Subject.Builder(x).setUser(user).build();
                }

                X subjectX = x.put("subject", subject);
                transactionDAO.inX(subjectX).put(transaction.fclone());
              } catch ( Exception ex ) {
                getLogger(x).error("Error reputting transaction " + transaction.getId(), ex);
              }
            }
          }
        }, "Reput UserComplianceTransactions");
      `
    },
    {
      name: 'getLogger',
      type: 'foam.nanos.logger.Logger',
      args: [ { name: 'x', type: 'Context' } ],
      javaCode: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) x.get("logger"));
      `
    }
  ]
});
