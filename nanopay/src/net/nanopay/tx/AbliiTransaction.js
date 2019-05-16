foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AbliiTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Transaction to be created specifically for ablii users, enforces source/destination to always be bank accounts`,

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
    'net.nanopay.util.Frequency',
    'net.nanopay.account.Account'
  ],

  methods: [
    {
      name: 'sendCompletedNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        if ( getStatus() != TransactionStatus.COMPLETED || getInvoiceId() == 0 ) return;
        User sender = findSourceAccount(x).findOwner(x);
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        User receiver = (User) localUserDAO.find(findDestinationAccount(x).getOwner());
        if ( sender.getId() == receiver.getId() ) return;

        NumberFormat formatter = NumberFormat.getCurrencyInstance();
        String notificationMsg = sender.label() + " just initiated a payment to " + receiver.label() + " for " + formatter.format(getAmount()/100.00) + " on Invoice #" + this.findInvoiceId(x).getInvoiceNumber();
        notificationMsg += this.findInvoiceId(x).getPurchaseOrder().length() > 0 ? " PO" + this.findInvoiceId(x).getPurchaseOrder() + "." : ".";

        // notification to sender
        Notification senderNotification = new Notification();
        senderNotification.setUserId(sender.getId()); // this.getStat()
        senderNotification.setEmailIsEnabled(true);
        AppConfig    config    = (AppConfig) x.get("appConfig");

        HashMap<String, Object> args = new HashMap<>();
        args.put("amount",    formatter.format(getAmount()/100.00));
        args.put("name",      sender.getFirstName());
        args.put("link",      config.getUrl());

        senderNotification.setEmailName("transfer-paid");
        senderNotification.setBody(notificationMsg);
        senderNotification.setNotificationType("Transaction Initiated");
        senderNotification.setIssuedDate(this.findInvoiceId(x).getIssueDate());
        args.put("email",     sender.getEmail());
        args.put("applink" ,  config.getAppLink());
        args.put("playlink" , config.getPlayLink());

        senderNotification.setEmailArgs(args);
        ((DAO)x.get("notificationDAO")).put_(x, senderNotification);

        // notification to receiver
        Notification receiverNotification = new Notification();
        receiverNotification.setUserId(receiver.getId()); // this.getStat()
        receiverNotification.setEmailIsEnabled(true);

        args = new HashMap<>();
        args.put("amount",    formatter.format(getAmount()/100.00));
        args.put("name",      receiver.getFirstName());
        args.put("link",      config.getUrl());

        receiverNotification.setEmailName("transfer-paid");
        receiverNotification.setBody(notificationMsg);
        receiverNotification.setNotificationType("Transaction Initiated");
        receiverNotification.setIssuedDate(this.findInvoiceId(x).getIssueDate());
        args.put("email",     receiver.getEmail());
        args.put("applink" ,  config.getAppLink());
        args.put("playlink" , config.getPlayLink());

        receiverNotification.setEmailArgs(args);
        ((DAO)x.get("notificationDAO")).put_(x, receiverNotification);
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
        throw new RuntimeException("An invoice for this transaction was not provided.");
      }

      return tx;
    `
    }
  ]
});
