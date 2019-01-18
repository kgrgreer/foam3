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
    'java.util.Arrays',
    'foam.util.SafetyUtil'
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
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    }
  ],

  methods: [

    {
      name: 'sendReverseNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      if ( oldTxn == null ) return;
      if ( getStatus() != TransactionStatus.REVERSE && getStatus() != TransactionStatus.REVERSE_FAIL )
      return;

      DAO notificationDAO = ((DAO) x.get("notificationDAO"));
      if ( getStatus() == TransactionStatus.REVERSE_FAIL ) {
        Notification notification = new Notification();
        notification.setEmailIsEnabled(true);
        notification.setBody("Cash in transaction id: " + getId() + " was declined but failed to revert the balance.");
        notification.setNotificationType("Cashin transaction declined");
        notification.setGroupId("support");
        notificationDAO.put(notification);
        return;
      }
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
      documentation: `return true when status change is such that normal Transfers should be executed (applied)`,
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
      if ( getStatus() == TransactionStatus.COMPLETED &&
      ( oldTxn == null ||
        ( oldTxn != null &&
          oldTxn.getStatus() != TransactionStatus.COMPLETED ) ) ) {
   return true;
 }
 return false;
      `
    },
    {
      documentation: `return true when status change is such that reversal Transfers should be executed (applied)`,
      name: 'canReverseTransfer',
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
        if ( getStatus() == TransactionStatus.REVERSE && oldTxn != null && oldTxn.getStatus() != TransactionStatus.REVERSE ||
          getStatus() == TransactionStatus.DECLINED &&
             ( oldTxn == null ||
               ( oldTxn != null &&
                 oldTxn.getStatus() == TransactionStatus.COMPLETED ) ) ) {
          return true;
        }
        return false;
      `
    },
    {
      name: 'createTransfers',
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
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
      List all = new ArrayList();
      TransactionLineItem[] lineItems = getLineItems();

      if ( canTransfer(x, oldTxn) ) {
          for ( int i = 0; i < lineItems.length; i++ ) {
            TransactionLineItem lineItem = lineItems[i];
            Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, false);
            for ( int j = 0; j < transfers.length; j++ ) {
              all.add(transfers[j]);
            }
          }
          all.add(new Transfer.Builder(x)
              .setDescription(TrustAccount.find(x, findSourceAccount(x)).getName()+" Cash-In COMPLETED")
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
        else if ( canReverseTransfer(x, oldTxn ) ) {
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
