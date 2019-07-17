foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'IdentityMindIntegrationTest',
  extends: 'foam.nanos.test.Test',

  imports: [
    'accountDAO',
    'approvalRequestDAO',
    'identityMindService',
    'ruleDAO',
    'transactionDAO',
    'threadPool',
    'userDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.ruler.Rule',
    'foam.nanos.pool.StubThreadPool',
    'foam.util.SafetyUtil',
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
      value: 1400
    },
    {
      class: 'Long',
      name: 'identityMindUserId',
      value: 1013
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'sender',
      javaGetter: 'return findOrCreateUser("sender@test.com");'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'receiver',
      javaGetter: 'return findOrCreateUser("receiver@test.com");'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'sourceAccount',
      transient: true,
      javaGetter: 'return findOrCreateBankAccount(getSender(), "111111");',
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'destinationAccount',
      transient: true,
      javaGetter: 'return findOrCreateBankAccount(getReceiver(), "222222");',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        setX(x);
        if ( ! testIdentityMindTxRuleExists() ) {
          return;
        }

        // 1. test transaction ACCEPT-ed
        testTransactionAcceptedByIdentityMind();
        // 2. test transaction REJECTE-d
        // 3. test transaction MANUAL_REVIEW-ed
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
          .setSourceAccount(getSourceAccount().getId())
          .setDestinationAccount(getDestinationAccount().getId())
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
      name: 'testIdentityMindTxRuleExists',
      type: 'Boolean',
      javaCode: `
        Rule rule = (Rule) ((DAO) getRuleDAO()).find(getIdentityMindTxRuleId());
        boolean result = rule != null && ! SafetyUtil.isEmpty(rule.getDaoKey());

        test(result, "IdentityMind transaction rule exists");
        return result;
      `
    },
    {
      name: 'testTransactionAcceptedByIdentityMind',
      javaCode: `
        ((IdentityMindService) getIdentityMindService()).setDefaultProfile("ACCEPT");
        Transaction tx = newTransaction(1000);
        tx = (Transaction) ((DAO) getTransactionDAO()).put(tx);

        test(findTxApprovalRequest(tx) == null,
          "No approval request is created yet before the IdentityMind transaction rule is run");

        ((StubThreadPool) getThreadPool()).invokeAll();
        ApprovalRequest found = findTxApprovalRequest(tx);
        test(found != null && found.getApprover() == getIdentityMindUserId() && found.getStatus() == ApprovalStatus.APPROVED,
          "An approval request with status=APPROVED is created when the IdentityMind ACCEPT-ed the transaction");

        tx = (Transaction) ((DAO) getTransactionDAO()).find(tx);
        test(tx.getStatus() == TransactionStatus.COMPLETED, "Compliance transaction should be COMPLETED");
      `
    }
  ]
});
