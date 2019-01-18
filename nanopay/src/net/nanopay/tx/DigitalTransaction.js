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
    'foam.util.SafetyUtil'
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
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaCode: `
      super.validate(x);

      if ( ! SafetyUtil.isEmpty(getId()) ) {
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
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Boolean',
      javaCode: `
        return oldTxn == null && getStatus() != TransactionStatus.PENDING_PARENT_COMPLETED;
      `
    },
    {
      name: 'sendCompletedNotification',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldTxn', javaType: 'net.nanopay.tx.model.Transaction' }
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
    }
  ]
});
