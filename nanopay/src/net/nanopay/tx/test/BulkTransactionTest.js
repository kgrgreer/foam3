foam.CLASS({
  package: 'net.nanopay.tx.test',
  name: 'BulkTransactionTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.BulkTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO transactionQuoteDAO = (DAO) x.get("localTransactionQuotePlanDAO");
    Group group = setupGroup(x);
    User sender = setupUser(x, group, "sender");
    User receiver = setupUser(x, group, "receiver");
    Account sourceBank = setupBankAccount(x, sender);
    Account destinationBank = setupBankAccount(x, receiver);

    Transaction txn;
    TransactionQuote quote;

    BulkTransaction bulk = createBulkTransaction(x, sender, new User[] {receiver});
    bulk.setExplicitCI(false);
    bulk.setExplicitCO(false);
    quote = new TransactionQuote();
    quote.setRequestTransaction(bulk);
    quote = (TransactionQuote) transactionQuoteDAO.put_(x, quote);
    txn = quote.getPlan();
    // System.out.println("BulkTransaction (CI-D): "+txn);
    test( txn instanceof BulkTransaction, "CI-D root instanceof BulkTransaction");
    test( txn.getNext().length > 0, "CI-D root has next, found: "+txn.getNext().length);
    if ( txn.getNext().length > 0 ) {
      txn = txn.getNext()[0];
      test( txn instanceof CITransaction, "CI-D root.next[0] instanceof CITransaction, found: "+txn.getClass().getSimpleName());
      test( txn.getNext().length > 0, "CI-D root.next[0] has next, found: "+txn.getNext().length);
      if ( txn.getNext().length > 0 ) {
        txn = txn.getNext()[0];
        test( txn instanceof CompositeTransaction, "CI-D root.next[0].next[0] instanceof CompositeTransaction, found: "+txn.getClass().getSimpleName());
        test( txn.getNext().length > 0, "CI-D root.next[0].next[0] has next");
        if ( txn.getNext().length > 0 ) {
          txn = txn.getNext()[0];
          test( txn instanceof DigitalTransaction, "CI-D root.next[0].next[0].next[0] instanceof DigitalTransaction, found: "+txn.getClass().getSimpleName());
          test( txn.getNext().length == 0, "CI-D root.next[0].next[0].next[0] NOT has next, found: "+txn.getNext().length);
        }
      }
    }

    bulk = createBulkTransaction(x, sender, new User[] {receiver});
    bulk.setExplicitCI(false);
    bulk.setExplicitCO(true);
    quote = new TransactionQuote();
    quote.setRequestTransaction(bulk);
    quote = (TransactionQuote) transactionQuoteDAO.put_(x, quote);
    txn = quote.getPlan();
    // System.out.println("BulkTransaction (CI-D-CO): "+txn);
    test( txn instanceof BulkTransaction, "CI-D-CO root instanceof BulkTransaction");
    test( txn.getNext().length > 0, "CI-D-CO root has next, found: "+txn.getNext().length);
    if ( txn.getNext().length > 0 ) {
      txn = txn.getNext()[0];
      test( txn instanceof CITransaction, "CI-D root.next[0] instanceof CITransaction, found: "+txn.getClass().getSimpleName());

      test( txn.getNext().length > 0, "CI-D-CO root.next[0] has next, found: "+txn.getNext().length);
      if ( txn.getNext().length > 0 ) {
        txn = txn.getNext()[0];
        test( txn instanceof CompositeTransaction, "CI-D-CO root.next[0].next[0] instanceof CompositeTransaction, found: "+txn.getClass().getSimpleName());
        test( txn.getNext().length > 0, "CI-D-CO root.next[0].next[0] has next, found: "+txn.getNext().length);
        if ( txn.getNext().length > 0 ) {
          txn = txn.getNext()[0];
          test( txn instanceof DigitalTransaction, "CI-D-CO root.next[0].next[0].next[0] instanceof DigitalTransaction, found: "+txn.getClass().getSimpleName());
          test( txn.getNext().length > 0, "CI-D-CO root.next[0].next[0].next[0] has next, found: "+txn.getNext().length);
          if ( txn.getNext().length > 0 ) {
            txn = txn.getNext()[0];
            test( txn instanceof COTransaction, "CI-D-CO root.next[0].next[0].next[0].next[0] instanceof COTransaction, found: "+txn.getClass().getSimpleName());
          }
        }
      }
    }
      `
    },
    {
      name: 'setupGroup',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaType: 'Group',
      javaCode: `
    Group group = new Group();
    group.setId(this.getClass().getSimpleName());
    return (Group) ((DAO) x.get("localGroupDAO")).put_(x, group);
    `
    },
    {
      name: 'setupUser',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'group',
          type: 'Group'
        },
        {
          name: 'name',
          type: 'String'
        }
      ],
      javaType: 'User',
      javaCode: `
    User user = new User();
    user.setGroup(group.getId());
    user.setFirstName(name);
    user.setLastName(name);
    user.setEmail(name+"."+group.getId()+"@nanopay.net");
    user.setEmailVerified(true);
    user.setStatus(AccountStatus.ACTIVE);
    user.setCompliance(ComplianceStatus.PASSED);
    return (User) ((DAO) x.get("userDAO")).put_(x, user);
    `
    },
    {
      name: 'setupBankAccount',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'user',
          type: 'User'
        },
      ],
      javaType: 'Account',
      javaCode: `
    BankAccount account = BankAccount.findDefault(x, user, "CAD");

    if ( account == null ) {

      final DAO  institutionDAO = (DAO) x.get("institutionDAO");
      final DAO  branchDAO     = (DAO) x.get("branchDAO");
      final DAO  accountDAO   = (DAO) x.get("localAccountDAO");

      Institution institution = new Institution.Builder(x)
        .setInstitutionNumber(String.valueOf(user.getId()))
        .build();
      institution = (Institution) institutionDAO.put_(x, institution);

      Branch branch = new Branch.Builder(x)
        .setBranchId(String.valueOf(user.getId()))
        .setInstitution(institution.getId())
        .build();
      branch = (Branch) branchDAO.put_(x, branch);

      account = new CABankAccount.Builder(x)
        .setAccountNumber(String.valueOf(user.getId()))
        .setBranch( branch.getId() )
        .setOwner(user.getId())
        .setName(user.getLegalName())
        .setStatus(BankAccountStatus.VERIFIED)
        .build();

      return (Account) accountDAO.put_(x, account);
    } else {
      return account;
    }
    `
    },
    {
      name: 'createBulkTransaction',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'sender',
          type: 'User'
        },
        {
          name: 'receivers',
          type: 'User []',
//          of: 'User'
        }
      ],
      javaType: 'BulkTransaction',
      javaCode: `
    BulkTransaction bulk = new BulkTransaction();
    bulk.setPayerId(sender.getId());
    for ( int i = 0; i < receivers.length; i++) {
      User u = receivers[i];
      Transaction dest = new Transaction();
      dest.setPayeeId(u.getId());
      dest.setAmount(100);
      bulk.addNext(dest);
    }
    return bulk;
    `
    }
  ]
});
