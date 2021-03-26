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
  package: 'net.nanopay.tx.test',
  name: 'BulkTransactionTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.cico.InterTrustTransaction',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.BulkTransaction',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.payment.PADTypeLineItem'
  ],

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO transactionQuoteDAO = (DAO) x.get("localTransactionPlannerDAO");
    User sender = setupUser(x, "sender");
    User receiver = setupUser(x, "receiver");
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
          test( txn instanceof ComplianceTransaction, "CI-D root.next[0].next[0].next[0] instanceof ComplianceTransaction, found: "+txn.getClass().getSimpleName());
          test( txn.getNext().length > 0, "CI-D root.next[0].next[0].next[0] has next, found: "+txn.getNext().length);
          if ( txn.getNext().length > 0 ) {
            txn = txn.getNext()[0];
            //NOTE. Since setup up of the test journals includes multiple trusts, the bulk can actually plan inter trusts if requested.
            test( (txn instanceof DigitalTransaction) || (txn instanceof InterTrustTransaction), "CI-D root.next[0].next[0].next[0].next[0] instanceof DigitalTransaction, found: "+txn.getClass().getSimpleName());
            test( txn.getNext().length == 0, "CI-D root.next[0].next[0].next[0].next[0] NOT has next, found: "+txn.getNext().length);
          }
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
          test( txn instanceof ComplianceTransaction, "CI-D-CO root.next[0].next[0].next[0] instanceof ComplianceTransaction, found: "+txn.getClass().getSimpleName());
          test( txn.getNext().length > 0, "CI-D-CO root.next[0].next[0].next[0] has next, found: "+txn.getNext().length);
          if ( txn.getNext().length > 0 ) {
            txn = txn.getNext()[0];
            test( txn instanceof DigitalTransaction || txn instanceof InterTrustTransaction, "CI-D-CO root.next[0].next[0].next[0].next[0] instanceof DigitalTransaction, found: "+txn.getClass().getSimpleName());
            test( txn.getNext().length > 0, "CI-D-CO root.next[0].next[0].next[0].next[0] has next, found: "+txn.getNext().length);
            if ( txn.getNext().length > 0 ) {
              txn = txn.getNext()[0];
              test( txn instanceof COTransaction, "CI-D-CO root.next[0].next[0].next[0].next[0].next[0] instanceof COTransaction, found: "+txn.getClass().getSimpleName());
            }
          }
        }
      }
    }

    testPADTypeBeforeQuote(x, sender, receiver);
      `
    },
    {
      name: 'testPADTypeBeforeQuote',
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
          name: 'receiver',
          type: 'User',
        }
      ],
      javaCode: `
    DAO transactionQuoteDAO = (DAO) x.get("localTransactionPlannerDAO");
    BulkTransaction bulk = createBulkTransaction(x, sender, new User[] {receiver});
    PADTypeLineItem.addTo(bulk, 700);
    bulk.setExplicitCI(true);
    bulk.setExplicitCO(true);

    TransactionQuote quote = new TransactionQuote.Builder(x).setRequestTransaction(bulk).build();
    quote = (TransactionQuote) transactionQuoteDAO.inX(x).put(quote);
    Transaction next = quote.getPlan(); // BulkTransaction
    CITransaction ciTransaction = (CITransaction) next.getNext()[0];
    next = ciTransaction;
    next = next.getNext()[0]; // Composite
    next = next.getNext()[0]; // Compliance
    next = next.getNext()[0]; // Digital
    COTransaction coTransaction = (COTransaction) next.getNext()[0];

    test(PADTypeLineItem.getPADTypeFrom(x, ciTransaction).getId() == 700, "CI Transaction PAD type set to 700.");
    test(PADTypeLineItem.getPADTypeFrom(x, coTransaction).getId() == 700, "CO Transaction PAD type set to 700.");
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
          name: 'name',
          type: 'String'
        }
      ],
      javaType: 'User',
      javaCode: `
    User user = new User();
    user.setGroup("business");
    user.setSpid("nanopay");
    user.setFirstName(name);
    user.setLastName(name);
    user.setEmail(name+".business@nanopay.net");
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

    long amount = 0L;
    List<Transaction> children = new ArrayList<>();
    for ( int i = 0; i < receivers.length; i++) {
      User u = receivers[i];
      Transaction dest = new Transaction();
      dest.setPayeeId(u.getId());
      dest.setAmount(100);
      amount += 100;
      children.add(dest);
    }
    bulk.setChildren(children.toArray(new Transaction[children.size()]));
    return bulk;
    `
    }
  ]
});
