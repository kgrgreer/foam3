foam.CLASS({
    package: 'net.nanopay.tx.ruler',
    name: 'SendCompleteRetailTransactionNotificationRule',

    documentation: 'Send complete retail transaction notification.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.logger.Logger',
      'net.nanopay.tx.RetailTransaction',
      'foam.nanos.auth.User',
      'foam.nanos.notification.push.PushService',
      'foam.util.SafetyUtil',
      'java.util.HashMap',
      'java.util.Map'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            RetailTransaction oldTxn = (RetailTransaction) oldObj;
            RetailTransaction txn    = (RetailTransaction) obj;
            try {
              // If retail transaction is a payment to merchant
              if ( txn.getDeviceId() != 0 ) { return; }

              User sender = txn.findSourceAccount(x).findOwner(x);
              User receiver = txn.findDestinationAccount(x).findOwner(x);
              PushService push = (PushService) x.get("push");

              // If recipient does not have a device token to perform push notification
              if ( SafetyUtil.isEmpty(receiver.getDeviceToken()) ) { return; }

              Map<String, String> data = new HashMap<String, String>();
              data.put("senderEmail", sender.getEmail());
              data.put("amount", Long.toString(txn.getAmount()));
              push.sendPush(receiver, "You've received money!", data);

            } catch (Exception e) {
              Logger logger = (Logger) x.get("logger");
              logger.warning("Transaction failed to send notitfication. " + e.getMessage());
            }
          }
        }, "Retail Transaction Notification Sent");
        `
      }
    ]
  });
