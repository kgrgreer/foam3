foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AbliiTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  documentation: `Transaction to be created specifically for ablii users, enforces source/destination to always be bank accounts`,

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'java.lang.StringBuilder',
    'net.nanopay.account.Account',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.exchangeable.Currency',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  messages: [
    {
      name: 'PROHIBITED_MESSAGE',
      message: 'You do not have permission to pay invoices.'
    }
  ],

  methods: [
    {
      documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return false;
      `
    },
    {
      name: 'executeBeforePut',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      Transaction tx = super.executeBeforePut(x, oldTxn);

      // An invoice is required to create an ablii transaction
      if( tx.findInvoiceId(x) == null ) {
        ((Logger) x.get("logger")).error("An invoice was not provided for this transaction");
        throw new RuntimeException("An invoice for this transaction was not provided.");
      }

      return tx;
    `
    },
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        super.authorizeOnCreate(x);

        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "invoice.pay") ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        super.authorizeOnUpdate(x, oldObj);

        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "invoice.pay") ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' },
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        super.authorizeOnDelete(x);
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        super.authorizeOnRead(x);
      `
    },
  ]
});
