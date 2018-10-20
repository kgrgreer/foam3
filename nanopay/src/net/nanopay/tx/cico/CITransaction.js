foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'CITransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.dao.DAO',
    'java.util.HashMap',
    'java.text.NumberFormat',
    'foam.nanos.notification.Notification',
    'foam.nanos.auth.User',
    'foam.nanos.app.AppConfig'
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaCode: `
      super.validate(x);

      if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findSourceAccount(x)).getStatus())) {
        throw new RuntimeException("Bank account must be verified");
      }

      if ( getId() != "" ) {
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn.getStatus().equals(TransactionStatus.DECLINED) || oldTxn.getStatus().equals(TransactionStatus.REVERSE) || 
          oldTxn.getStatus().equals(TransactionStatus.REVERSE_FAIL) ||
          oldTxn.getStatus().equals(TransactionStatus.COMPLETED) && ! getStatus().equals(TransactionStatus.DECLINED) ) {
          throw new RuntimeException("Unable to update CITransaction, if transaction status is accepted or declined. Transaction id: " + getId());
        }
      }
      `
    },

    {
      name: 'sendReverseNotification',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldTxn', javaType: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      if ( oldTxn == null ) return;
      if ( ! (getStatus() == TransactionStatus.REVERSE) )
      return;
      DAO notificationDAO = ((DAO) x.get("notificationDAO"));
      User sender = findSourceAccount(x).findOwner(x);
      User receiver = findDestinationAccount(x).findOwner(x);
      Notification notification = new Notification();
      notification.setEmailIsEnabled(true);

      if ( getInvoiceId() != 0 ) {
        notification.setBody("Transaction for invoice #" + getInvoiceId() + " was rejected. Receiver's balance was reverted, invoice was not paid.");
      notification.setUserId(sender.getId());
      notification.setNotificationType("Reject invoice payment");
      notification.setEmailName("pay-from-bank-account-reject");

      NumberFormat formatter = NumberFormat.getCurrencyInstance();
      HashMap<String, Object> args = new HashMap<>();
      AppConfig config       = (AppConfig) x.get("appConfig");

      args.put("amount", formatter.format(getAmount() / 100.00));
      args.put("name", sender.getFirstName());
      args.put("account", ((BankAccount)findSourceAccount(x)).getAccountNumber());
      args.put("payerName", sender.getFirstName());
      args.put("payeeName", receiver.getFirstName());
      args.put("link",    config.getUrl());

      notification.setEmailArgs(args);

      Notification notificationReceiver = new Notification();
      notificationReceiver.copyFrom(notification);
      notificationReceiver.setUserId(receiver.getId());
      args.put("name", receiver.getFirstName());
      notificationReceiver.setEmailArgs(args);

      notificationDAO.put(notification);
      notificationDAO.put(notificationReceiver);
    } else {
      notification.setBody("Your Cash In transaction was rejected.");
      notification.setUserId(receiver.getId());
      notification.setNotificationType("Reject Cash in transaction");
      notification.setEmailName("cashin-reject");
      NumberFormat formatter = NumberFormat.getCurrencyInstance();
      HashMap<String, Object> args = new HashMap<>();
      AppConfig config       = (AppConfig) x.get("appConfig");

      args.put("amount", formatter.format(getAmount() / 100.00));
      args.put("name", receiver.getFirstName());
      args.put("account", ((BankAccount)findSourceAccount(x)).getAccountNumber());
      args.put("link",    config.getUrl());

      notification.setEmailArgs(args);
      notificationDAO.put(notification);

    }
      
      `
    }
  ]
});
