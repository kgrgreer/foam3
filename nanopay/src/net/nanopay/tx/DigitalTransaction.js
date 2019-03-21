foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DigitalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.text.NumberFormat',
    'java.util.HashMap',
    'java.util.List',
    'java.util.ArrayList',
    'foam.util.SafetyUtil',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.liquidity.LiquiditySettings',
    'net.nanopay.liquidity.Frequency',
    'net.nanopay.account.Account'
],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Digital Transfer';
      },
      javaFactory: `
    return "Digital Transfer";
      `,
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        return [
          'No status to choose.'
        ];
      }
    }
  ],

  methods: [
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
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, getStatus() == TransactionStatus.REVERSE);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        all.add(new Transfer.Builder(x).setAccount(getSourceAccount()).setAmount(-getTotal()).build());
        all.add(new Transfer.Builder(x).setAccount(getDestinationAccount()).setAmount(getTotal()).build());
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

      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( ! SafetyUtil.isEmpty(getId()) && oldTxn.getStatus() != TransactionStatus.PENDING_PARENT_COMPLETED && oldTxn.getStatus() != TransactionStatus.PENDING  ) {
        throw new RuntimeException("instanceof DigitalTransaction cannot be updated.");
      }
      `
    },
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
        return oldTxn == null && getStatus() != TransactionStatus.PENDING_PARENT_COMPLETED;
      `
    },
    {
      name: 'sendCompletedNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        if ( getStatus() != TransactionStatus.COMPLETED || getInvoiceId() != 0 ) return;
        User sender = findSourceAccount(x).findOwner(x);
        User receiver = findDestinationAccount(x).findOwner(x);
        if ( sender.getId() == receiver.getId() ) return;

        Notification notification = new Notification();
        notification.setUserId(receiver.getId());
        notification.setEmailIsEnabled(true);
        AppConfig    config    = (AppConfig) x.get("appConfig");
        NumberFormat formatter = NumberFormat.getCurrencyInstance();

        HashMap<String, Object> args = new HashMap<>();
        args.put("amount",    formatter.format(getAmount()/100.00));
        args.put("name",      receiver.getFirstName());
        args.put("link",      config.getUrl());

        notification.setEmailName("transfer-paid");
        notification.setBody("You received $" + getAmount()/100.00 + " from " + sender.label());
        notification.setNotificationType("Received transfer");
        args.put("email",     receiver.getEmail());
        args.put("applink" ,  config.getAppLink());
        args.put("playlink" , config.getPlayLink());

        notification.setEmailArgs(args);
        ((DAO)x.get("notificationDAO")).put_(x, notification);
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
      ls.liquifyAccount(source.getId(), Frequency.PER_TRANSACTION, -getAmount());
      ls.liquifyAccount(destination.getId(), Frequency.PER_TRANSACTION, getAmount());
      `
    }
  ]
});
