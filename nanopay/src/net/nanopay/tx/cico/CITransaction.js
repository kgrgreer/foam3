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
    'foam.nanos.app.AppConfig',
    'net.nanopay.tx.Transfer',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'java.util.Arrays'
  ],

  properties: [
    {
      name: 'displayType',
      factory: function() {
        return 'Cash In';
      }
    }
  ],

  methods: [

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
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
      Transfer [] tr = new Transfer[] {};
      Account account = findSourceAccount(x);
      TrustAccount trustAccount = TrustAccount.find(x, account);

      if ( getStatus() == TransactionStatus.COMPLETED ) {

        Transfer transfer = new Transfer.Builder(getX())
                              .setDescription(trustAccount.getName()+" Cash-In")
                              .setAccount(trustAccount.getId())
                              .setAmount(-getTotal())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(getX())
            .setDescription("Cash-In")
            .setAccount(getDestinationAccount())
            .setAmount(getTotal())
            .build()
        };
      } else if ( getStatus() == TransactionStatus.DECLINED &&
                  oldTxn != null &&
                  oldTxn.getStatus() == TransactionStatus.COMPLETED ) {

        Transfer transfer = new Transfer.Builder(x)
                              .setDescription(trustAccount.getName()+" Cash-In DECLINED")
                              .setAccount(trustAccount.getId())
                              .setAmount(getTotal())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(x)
            .setDescription("Cash-In DECLINED")
            .setAccount(getDestinationAccount())
            .setAmount(-getTotal())
            .build()
        };
        Transfer[] replacement = Arrays.copyOf(getReverseTransfers(), getReverseTransfers().length + tr.length);
      System.arraycopy(tr, 0, replacement, getReverseTransfers().length, tr.length);
        setStatus(TransactionStatus.REVERSE);
        return replacement;
      } else return new Transfer[0];
      Transfer[] replacement = Arrays.copyOf(getTransfers(), getTransfers().length + tr.length);
      System.arraycopy(tr, 0, replacement, getTransfers().length, tr.length);
      return replacement;
      `
    }
  ]
});
