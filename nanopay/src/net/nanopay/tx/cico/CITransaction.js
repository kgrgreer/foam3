foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'CITransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'java.text.NumberFormat',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.HashMap',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.model.Currency',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer'
  ],
  imports: [
    'transactionDAO'
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
        if ( this.status == this.TransactionStatus.PENDING_PARENT_COMPLETED ) {
          return [
            'choose status',
            ['PAUSED', 'PAUSED']
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
          if ( this.parent > 0 && ! ( this.transactionDAO.find(parent).status == this.TransactionStatus.COMPLETED ) ){
            return [
              'choose status',
              ['PENDING_PARENT_COMPLETED', 'UNPAUSE'],
              ['CANCELLED', 'CANCELLED']
            ];
          }
          else {
            return [
              'choose status',
              ['PENDING', 'UNPAUSE'],
              ['CANCELLED', 'CANCELLED']
            ];
          }
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

        if (
          getStatus() != TransactionStatus.REVERSE &&
          getStatus() != TransactionStatus.REVERSE_FAIL &&
          getStatus() != TransactionStatus.DECLINED
        ) return;

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

        // Traverse the chain to find the invoiceId if there is one.
        DAO localTransactionDAO = (DAO) x.get("localTransactionDAO");
        Transaction t = this;
        String parent = t.getParent();

        while ( ! SafetyUtil.isEmpty(parent) ) {
          t = (Transaction) localTransactionDAO.inX(x).find(t.getParent());
          parent = t.getParent();
        }

        long invoiceId = t.getInvoiceId();

        if ( invoiceId != 0 ) {
          notification.setBody("Transaction for invoice #" + invoiceId + " was rejected. Receiver's balance was reverted, invoice was not paid.");
          notification.setUserId(sender.getId());
          notification.setNotificationType("Reject invoice payment");
          notification.setEmailName("pay-from-bank-account-reject");

          HashMap<String, Object> args = new HashMap<>();
          AppConfig config = (AppConfig) (sender.findGroup(x)).getAppConfig(x);

          DAO invoiceDAO = (DAO) x.get("invoiceDAO");
          Invoice invoice = (Invoice) invoiceDAO.find(invoiceId);
          DAO currencyDAO = (DAO) x.get("currencyDAO");
          Currency currency = (Currency) currencyDAO.find(invoice.getDestinationCurrency());

          if ( ! Invoice.INVOICE_NUMBER.isDefaultValue(invoice) ) {
            args.put("invoiceNumber", invoice.getInvoiceNumber());
          }

          args.put("amount", currency.format(getAmount()));
          args.put("toName", sender.label());
          args.put("name", receiver.label());
          args.put("reference", invoice.getReferenceId());
          args.put("sendTo", sender.getEmail());
          args.put("account", ((BankAccount) findSourceAccount(x)).getAccountNumber());
          args.put("payerName", sender.getFirstName());
          args.put("payeeName", receiver.getFirstName());
          args.put("link", config.getUrl());

          notification.setEmailArgs(args);
          notificationDAO.put(notification);
        } else {
          notification.setBody("Your Cash In transaction was rejected.");
          notification.setUserId(receiver.getId());
          notification.setNotificationType("Reject Cash in transaction");
          notification.setEmailName("cashin-reject");
          NumberFormat formatter = NumberFormat.getCurrencyInstance();
          HashMap<String, Object> args = new HashMap<>();
          AppConfig config;
          String group = receiver.getGroup();
          if ( SafetyUtil.isEmpty(group) ) {
            config = (AppConfig) x.get("appConfig");
          } else {
            config = (AppConfig) (receiver.findGroup(x)).getAppConfig(x);
          }

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
    }
  ]
});
