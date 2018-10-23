foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DigitalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.model.TransactionStatus',
    'java.text.NumberFormat',
    'java.util.HashMap'
],
  
  properties: [
    {
      name: 'displayType',
      factory: function() {
        return 'Digital Transfer';
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

      if ( getId() != "" ) {
        throw new RuntimeException("instanceof DigitalTransaction cannot be updated.");
      }
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

      if ( receiver != null && ! SafetyUtil.isEmpty(receiver.getDeviceToken()) ) {
        PushService push = (PushService) x.get("push");
        Map<String, String> data = new HashMap<String, String>();
        data.put("senderEmail", sender.getEmail());
        data.put("amount", Long.toString(getAmount()));
        push.sendPush(receiver, "You've received money!", data);
      }

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
