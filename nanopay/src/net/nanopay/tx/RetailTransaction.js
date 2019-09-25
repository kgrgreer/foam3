foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'RetailTransaction',
  extends: 'net.nanopay.tx.DigitalTransaction',

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.push.PushService',
    'foam.util.SafetyUtil'
    'java.util.HashMap',
    'java.util.Map',

  ],

  properties: [
    {
      documentation: `For retail purposes. Tip`,
      class: 'Currency',
      name: 'tip',
      label: 'Tip',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(tip, X) {
        var formattedAmount = tip/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'Currency',
      name: 'total',
      visibility: foam.u2.Visibility.RO,
      label: 'Total Amount',
      transient: true,
      expression: function(amount, tip) {
        return amount + tip;
      },
      javaGetter: `return getAmount() + getTip();`,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        var refund =
          (X.status == net.nanopay.tx.model.TransactionStatus.REFUNDED );

        this
          .start()
          .addClass(refund ? 'amount-Color-Red' : 'amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      documentation: 'messages/notes related to transactions for retail.',
      class: 'String',
      name: 'notes',
      label: 'Notes'
    },
    {
      documentation: `For retail purposes. DeviceId refers to the device used to display the QR code for this transaction.`,
      class: 'Reference',
      of: 'net.nanopay.retail.model.Device',
      name: 'deviceId',
      swiftType: 'Int?',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'challenge',
      visibility: foam.u2.Visibility.RO,
      documentation: `Randomly generated challenge.
      Used as an identifier (along with payee/payer and amount and device id) for a retail trasnaction,
      used in the merchant app and is transfered to the mobile applications as a property of the QrCode.
      Can be moved to retail Transaction.`
    }
 ],

 methods: [
   {
     name: 'sendCompletedNotification',
     args: [
       { name: 'x', type: 'Context' },
       { name: 'oldTxn', type: 'net.nanopay.tx.model.Transaction' }
     ],
     javaCode: `
       // If retail transaction is a payment to merchant
       if ( getDeviceId() != 0 ) { return; }

       User sender = findSourceAccount(x).findOwner(x);
       User receiver = findDestinationAccount(x).findOwner(x);
       PushService push = (PushService) x.get("push");

       // If recipient does not have a device token to perform push notification
       if ( SafetyUtil.isEmpty(receiver.getDeviceToken()) ) { return; }

       Map<String, String> data = new HashMap<String, String>();
       data.put("senderEmail", sender.getEmail());
       data.put("amount", Long.toString(getAmount()));
       push.sendPush(receiver, "You've received money!", data);
     `
   },
   {
     name: 'executeAfterPut',
     javaCode: `
       super.executeAfterPut(x, oldTxn);
       try {
         sendCompletedNotification(x, oldTxn);
       } catch (Exception e) {
         Logger logger = (Logger) x.get("logger");
         logger.warning("Transaction failed to send notitfication. " + e.getMessage());
       }
     `
   }
 ]
});
