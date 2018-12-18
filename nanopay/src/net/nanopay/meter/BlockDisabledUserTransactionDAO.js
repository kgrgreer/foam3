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
      value: 'Transaction: %s is blocked because the %s is disabled.'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Transaction txn = (Transaction) obj;

        if (!checkAccountOwner(x, txn.findSourceAccount(x))) {
          blockTransaction(txn, "payer");
        }

        if (!checkAccountOwner(x, txn.findDestinationAccount(x))) {
          blockTransaction(txn, "payer");
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'checkAccountOwner',
      javaReturns: 'boolean',
      args: [
        { of: 'foam.core.X', name: 'x' },
        { of: 'Account', name:'account' }
      ],
      javaCode: `
        if (account != null) {
          User user = account.findOwner(x);

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
  ]
});
