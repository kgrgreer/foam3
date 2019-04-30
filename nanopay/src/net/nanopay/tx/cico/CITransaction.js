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
    'foam.util.SafetyUtil',
    'net.nanopay.liquidity.LiquidityService'
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
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.COMPLETED ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.SENT ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED'],
            ['COMPLETED', 'COMPLETED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['PAUSED', 'PAUSED'],
            ['DECLINED', 'DECLINED'],
            ['COMPLETED', 'COMPLETED'],
            ['SENT', 'SENT']
          ];
        }
        if ( this.status == this.TransactionStatus.PAUSED ) {
          return [
            'choose status',
            ['PENDING', 'PENDING'],
            ['CANCELLED', 'CANCELLED']
          ];
        }
        return ['No status to choose'];
      }
    }
  ],

  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.limitedCopyFrom(other);
      setCompletionDate(other.getCompletionDate());
      setProcessDate(other.getProcessDate());
      `
    },
    {
      name: 'sendReverseNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      if ( oldTxn == null ) return;
      if ( getStatus() != TransactionStatus.DECLINED)
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

      String bankAccountNumber = ((BankAccount)findSourceAccount(x)).getAccountNumber();
      args.put("amount", formatter.format(getAmount() / 100.00));
      args.put("name", receiver.getFirstName());
      args.put("account", bankAccountNumber.substring(bankAccountNumber.length()-4, bankAccountNumber.length()));
      args.put("link",    config.getUrl());

      notification.setEmailArgs(args);
      notificationDAO.put(notification);
    }
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
      return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      super.validate(x);

      if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findSourceAccount(x)).getStatus())) {
        throw new RuntimeException("Bank account must be verified");
      }
      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && ( oldTxn.getStatus().equals(TransactionStatus.DECLINED) || oldTxn.getStatus().equals(TransactionStatus.REVERSE) ||
        oldTxn.getStatus().equals(TransactionStatus.REVERSE_FAIL) ||
        oldTxn.getStatus().equals(TransactionStatus.COMPLETED) ) && ! getStatus().equals(TransactionStatus.DECLINED) ) {
        throw new RuntimeException("Unable to update CITransaction, if transaction status is accepted or declined. Transaction id: " + getId());
      }
      `
    },
    {
      documentation: `LiquidityService checks whether digital account has any min or/and max balance if so, does appropriate actions(cashin/cashout)`,
      name: 'checkLiquidity',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      LiquidityService ls = (LiquidityService) x.get("liquidityService");
      Account source = findSourceAccount(x);
      Account destination = findDestinationAccount(x);
      if ( ! SafetyUtil.equals(source.getOwner(), destination.getOwner()) && getStatus() == TransactionStatus.COMPLETED ) {
        ls.liquifyAccount(destination.getId(), net.nanopay.liquidity.Frequency.PER_TRANSACTION, getAmount());
      }
      `
    },
    {
      documentation: 'Checks if a Transaction needs to be reversed',
      name: 'canReverse',
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
      type: 'boolean',
      javaCode: `
        return (this.getStatus() == TransactionStatus.DECLINED && oldTxn != null &&
          oldTxn.getStatus() == TransactionStatus.COMPLETED );
      `
    }
  ]
});
