foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SendEmailNotificationTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Sends notification about transaction's status update.
  `,

  javaImports: [
  'foam.nanos.notification.Notification',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(((Transaction)obj).getId());
      Transaction transaction = (Transaction) getDelegate().put_(x, obj);
      
      transaction.sendReverseNotification(getX(), oldTxn);
      transaction.sendCompletedNotification(getX(), oldTxn);

      return transaction;
      `
    },
  ]
});
