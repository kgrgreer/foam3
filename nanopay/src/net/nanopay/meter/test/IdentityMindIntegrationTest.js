foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'IdentityMindIntegrationTest',
  extends: 'foam.nanos.test.Test',

  imports: [
    'accountDAO',
    'approvalRequestDAO',
    'identityMindService',
    'nSpecDAO',
    'ruleDAO',
    'transactionDAO',
    'threadPool',
    'userDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'foam.nanos.boot.NSpec',
    'foam.nanos.pool.StubThreadPool',
    'foam.nanos.ruler.Rule',
    'foam.util.Auth',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.meter.compliance.identityMind.IdentityMindService',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'identityMindTxRuleId',
      value: 1440
    },
    {
      class: 'Long',
      name: 'jackieRule1Id',
      value: 3000
    },
    {
      class: 'Long',
      name: 'identityMindUserId',
      value: 1013
    },
    {
      class: 'Long',
      name: 'fraudOpsUserId',
      value: 1012
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        setX(x);
        setUp();
        if ( testIdentityMindTxRulesEnabled() ) {
          // 1. test transaction ACCEPT-ed
          testTransactionAcceptedByIdentityMind();
          // 2. test transaction REJECT-ed
          testTransactionRejectedByIdentityMind();
          // 3. test transaction MANUAL_REVIEW-ed
          testTransactionManualReviewedByIdentityMind();
        }
        tearDown();
      `
    },
    {
      name: 'setUp',
      javaCode: `
        // Enabled IdentityMind transaction rule
        DAO ruleDAO = (DAO) getRuleDAO();
        identityMindRule_ = (Rule) ruleDAO.find(getIdentityMindTxRuleId());
        if ( identityMindRule_ != null && ! identityMindRule_.getEnabled() ) {
          Rule cloned = (Rule) identityMindRule_.fclone();

          cloned.setEnabled(true);
          ruleDAO.put(cloned);
        }
        
        // Disabled Jackie rule 1
        jackieRule1_ = (Rule) ruleDAO.find(getJackieRule1Id());
        if ( jackieRule1_ != null && jackieRule1_.getEnabled() ) {
          Rule cloned = (Rule) jackieRule1_.fclone();

          cloned.setEnabled(false);
          ruleDAO.put(cloned);
        }

        // Setup users and accounts
        sender_ = findOrCreateUser("sender@test.com");
        receiver_ = findOrCreateUser("receiver@test.com");
        sourceAccount_ = findOrCreateBankAccount(sender_, "111111");
        destinationAccount_ = findOrCreateBankAccount(receiver_, "222222");
        
        // Stub thread pool
        threadPool_ = getThreadPool();
        if ( ! (threadPool_ instanceof StubThreadPool) ) {
          DAO nSpecDAO = (DAO) getNSpecDAO();
          NSpec spec = (NSpec) nSpecDAO.find("threadPool");

          spec.setServiceClass("foam.nanos.pool.StubThreadPool");
          nSpecDAO.put(spec);
        }

        // Sudo sender
        senderX_ = Auth.sudo(getX(), sender_);
      `
    },
    {
      name: 'tearDown',
      javaCode: `
        // Restore IdentityMind rule
        DAO ruleDAO = (DAO) getRuleDAO();
        if ( ! identityMindRule_.equals(ruleDAO.find(identityMindRule_)) ) {
          ruleDAO.put(identityMindRule_);
        }

        // Restore Jackie rule 1
        if ( ! jackieRule1_.equals(ruleDAO.find(jackieRule1_)) ) {
          ruleDAO.put(jackieRule1_);
        }

        // Restore thread pool
        if ( threadPool_ != null && threadPool_ != getThreadPool() ) {
          DAO nSpecDAO = (DAO) getNSpecDAO();
          NSpec spec = (NSpec) nSpecDAO.find("threadPool");

          spec.setServiceClass(threadPool_.getClass().getName());
          nSpecDAO.put(spec);
        }
      `
    },
    {
      name: 'newTransaction',
      args: [
        { name: 'amount', type: 'Long' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        return new ComplianceTransaction.Builder(getX())
          .setSourceAccount(sourceAccount_.getId())
          .setDestinationAccount(destinationAccount_.getId())
          .setAmount(amount)
          .setIsQuoted(true)
          .build();
      `
    },
    {
      name: 'findOrCreateBankAccount',
      args: [
        { name: 'owner', type: 'foam.nanos.auth.User' },
        { name: 'accountNumber', type: 'String' }
      ],
      type: 'net.nanopay.bank.BankAccount',
      javaCode: `
        DAO dao = (DAO) getAccountDAO();
        BankAccount ret = (BankAccount) dao.find(AND(
          EQ(BankAccount.OWNER, owner.getId()),
          INSTANCE_OF(BankAccount.class)
        ));

        if ( ret == null ) {
          ret = new BankAccount.Builder(getX())
            .setAccountNumber(accountNumber)
            .setName(accountNumber)
            .setOwner(owner.getId())
            .setStatus(BankAccountStatus.VERIFIED)
            .build();
          ret = (BankAccount) dao.put(ret).fclone();
        }
        return ret;
      `
    },
    {
      name: 'findOrCreateUser',
      args: [
        { name: 'email', type: 'String' }
      ],
      type: 'foam.nanos.auth.User',
      javaCode: `
        DAO dao = (DAO) getUserDAO();
        User ret = (User) dao.find(EQ(User.EMAIL, email));

        if ( ret == null ) {
          ret = new User.Builder(getX())
            .setEmail(email)
            .setEmailVerified(true)
            .setFirstName("t")
            .setLastName("s")
            .setGroup("basicUser")
            .build();
          ret = (User) dao.put(ret).fclone();
        }
        return ret;
      `
    },
    {
      name: 'findTxApprovalRequest',
      args: [
        { name: 'transaction', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'net.nanopay.approval.ApprovalRequest',
      javaCode: `
        return (ApprovalRequest) ((DAO) getApprovalRequestDAO()).find(AND(
          EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO"),
          EQ(ApprovalRequest.OBJ_ID, transaction.getId())
        ));
      `
    },
    {
      name: 'testIdentityMindTxRulesEnabled',
      type: 'Boolean',
      javaCode: `
        Long[] ruleIds = new Long[] { getIdentityMindTxRuleId(), 1310L, 1520L };
        Count count = (Count) ((DAO) getRuleDAO())
          .where(AND(
            EQ(Rule.ENABLED, true),
            EQ(Rule.DAO_KEY, "localTransactionDAO"),
            IN(Rule.ID, ruleIds)))
          .select(new Count());

        boolean result = count.getValue() == ruleIds.length;
        test(result, "IdentityMind transaction rules are enabled");
        return result;
      `
    },
    {
      name: 'testTransactionAcceptedByIdentityMind',
      javaCode: `
        ((IdentityMindService) getIdentityMindService()).setDefaultProfile("ACCEPT");
        Transaction tx = newTransaction(1000);
        tx = (Transaction) ((DAO) getTransactionDAO()).inX(senderX_).put(tx);

        test(findTxApprovalRequest(tx) == null,
          "No approval request is created yet before the IdentityMind transaction rule is run");

        ((StubThreadPool) getThreadPool()).invokeAll();
        ApprovalRequest found = findTxApprovalRequest(tx);
        test(found != null && found.getApprover() == getIdentityMindUserId() && found.getStatus() == ApprovalStatus.APPROVED,
          "An approval request with status=APPROVED is created when the IdentityMind ACCEPT-ed the transaction");

        tx = (Transaction) ((DAO) getTransactionDAO()).find(tx);
        test(tx.getStatus() == TransactionStatus.COMPLETED, "Compliance transaction should be COMPLETED");
      `
    },
    {
      name: 'testTransactionRejectedByIdentityMind',
      javaCode: `
        ((IdentityMindService) getIdentityMindService()).setDefaultProfile("REJECT");
        Transaction tx = newTransaction(1100);
        tx = (Transaction) ((DAO) getTransactionDAO()).inX(senderX_).put(tx);

        ((StubThreadPool) getThreadPool()).invokeAll();
        ApprovalRequest found = findTxApprovalRequest(tx);
        test(found != null && found.getApprover() == getIdentityMindUserId() && found.getStatus() == ApprovalStatus.REJECTED,
          "An approval request with status=REJECTED is created when the IdentityMind REJECT-ed the transaction");

        tx = (Transaction) ((DAO) getTransactionDAO()).find(tx);
        test(tx.getStatus() == TransactionStatus.DECLINED, "Compliance transaction should be DECLINED");
      `
    },
    {
      name: 'testTransactionManualReviewedByIdentityMind',
      javaCode: `
        ((IdentityMindService) getIdentityMindService()).setDefaultProfile("MANUAL_REVIEW");
        Transaction tx = newTransaction(1200);
        tx = (Transaction) ((DAO) getTransactionDAO()).inX(senderX_).put(tx);

        ((StubThreadPool) getThreadPool()).invokeAll();
        ApprovalRequest found = findTxApprovalRequest(tx);
        test(found != null && found.getApprover() == getFraudOpsUserId() && found.getStatus() == ApprovalStatus.REQUESTED,
          "An approval request is created for fraud-ops user when the IdentityMind marked transaction as MANUAL_REVIEW");

        tx = (Transaction) ((DAO) getTransactionDAO()).find(tx);
        test(tx.getStatus() == TransactionStatus.PENDING, "Compliance transaction should be in PENDING");
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        protected Rule        identityMindRule_;
        protected Rule        jackieRule1_;
        protected User        sender_;
        protected User        receiver_;
        protected BankAccount sourceAccount_;
        protected BankAccount destinationAccount_;
        protected Object      threadPool_;
        protected X           senderX_;
        `);
      }
    }
  ]
});
