foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'NotifyReverseFailTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Determine destination account based on payee when account is not provided.
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

      // TODO: needs to use email template for each case

      // doesn't check for previous status because once transaction is reverse or reverse_fail status it can no longer be updated.
      Transaction retTxn = (Transaction) getDelegate().put_(x, obj);
      if ( retTxn.getStatus() == TransactionStatus.REVERSE || retTxn.getStatus() == TransactionStatus.REVERSE_FAIL ) {
        Notification senderNotification = new Notification();
        senderNotification.setUserId(retTxn.findSourceAccount(x).findOwner(getX()).getId());
        senderNotification.setNotificationType("Reverse transaction");
        senderNotification.setBody("Transaction was reverted since it was rejected by your bank. Transaction id: " + retTxn.getId());
        senderNotification.setEmailIsEnabled(true);
        ((DAO) x.get("notificationDAO")).put(senderNotification);
        if ( retTxn.findSourceAccount(x).getOwner() != retTxn.findDestinationAccount(x).getOwner() ) {
          Notification receiverNotification = new Notification();
          receiverNotification.setUserId(retTxn.findDestinationAccount(x).findOwner(getX()).getId());
          receiverNotification.setNotificationType("Reverse transaction");
          receiverNotification.setBody("Transaction was reverted since it was rejected by payee's bank bank. Transaction id: " + retTxn.getId());
          receiverNotification.setEmailIsEnabled(true);
        ((DAO) x.get("notificationDAO")).put(receiverNotification);
        }
        if ( retTxn.getStatus() == TransactionStatus.REVERSE_FAIL ) {
          Notification supportNotification = new Notification();
          supportNotification.setGroupId("support");
          supportNotification.setNotificationType("Reverse transaction");
          supportNotification.setBody("Transaction was reverted since it was rejected by payee's bank bank and there was not enough money to revert the balance. Transaction id: " + retTxn.getId());
          supportNotification.setEmailIsEnabled(true);
          ((DAO) x.get("notificationDAO")).put(supportNotification);
        }
      }
      return retTxn;
      `
    },
  ]
});
