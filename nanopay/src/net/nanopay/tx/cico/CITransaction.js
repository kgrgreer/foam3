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
    'java.util.List',
    'java.util.ArrayList',
    'java.text.NumberFormat',
    'foam.nanos.notification.Notification',
    'foam.nanos.auth.User',
    'foam.nanos.app.AppConfig',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'java.util.Arrays'
  ],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Cash In';
      },
      javaFactory: `
        return "Cash In";
      `
    },
    {
      name: 'transfers',
      javaFactory: `return new Transfer[0];`
    },
    {
      name: 'reverseTransfers',
      javaFactory: ` return new Transfer[0];`
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
      List all = new ArrayList();
      TransactionLineItem[] lineItems = getLineItems();

      if ( getStatus() == TransactionStatus.COMPLETED ) {
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, false);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        all.add(new Transfer.Builder(x)
            .setDescription(TrustAccount.find(x, findSourceAccount(x)).getName()+" Cash-In DECLINED")
            .setAccount(TrustAccount.find(x, findSourceAccount(x)).getId())
            .setAmount(-getTotal())
            .build());
          all.add( new Transfer.Builder(getX())
              .setDescription("Cash-In")
              .setAccount(getDestinationAccount())
              .setAmount(getTotal())
              .build());
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
      }
      else
      if ( getStatus() == TransactionStatus.DECLINED &&
      oldTxn != null && oldTxn.getStatus() == TransactionStatus.COMPLETED ) {
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, true);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        all.add( new Transfer.Builder(x)
        .setDescription(TrustAccount.find(x, findSourceAccount(x)).getName()+" Cash-In DECLINED")
        .setAccount(TrustAccount.find(x, findSourceAccount(x)).getId())
        .setAmount(getTotal())
        .build());
      all.add(new Transfer.Builder(x)
      .setDescription("Cash-In DECLINED")
      .setAccount(getDestinationAccount())
      .setAmount(-getTotal())
      .build());
        Transfer[] transfers = getReverseTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        setStatus(TransactionStatus.REVERSE);
      }
      return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});
