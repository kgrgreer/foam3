foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'BlockDisabledUserTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for preventing creation of transaction
      involving a disabled user as a payer or payee.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction'
  ],

  constants: [
    {
      name: 'BLOCK_TRANSACTION',
      type: 'String',
      value: 'Transaction: %d is blocked because the %s is disabled.'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Transaction txn = (Transaction) obj;
        bareUserDAO_ = (DAO) x.get("bareUserDAO");

        if (!checkAccountOwner(txn.findSourceAccount(x))) {
          blockTransaction(txn, "payer");
        }

        if (!checkAccountOwner(txn.findDestinationAccount(x))) {
          blockTransaction(txn, "payer");
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'checkAccountOwner',
      javaReturns: 'boolean',
      args: [
        { of: 'Account', name:'account' }
      ],
      javaCode: `
        if (account != null) {
          User user = (User) bareUserDAO_.find(account.getOwner());

          if (user != null) {
            return user.getEnabled();
          }
        }
        return true;
      `
    },
    {
      name: 'blockTransaction',
      javaReturns: 'void',
      args: [
        { of: 'Transaction', name: 'transaction' },
        { of: 'String', name: 'user' }
      ],
      javaCode: `
        throw new RuntimeException(
          String.format(BLOCK_TRANSACTION, transaction.getId(), user));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`private foam.dao.DAO bareUserDAO_;`);
      }
    }
  ],
});
