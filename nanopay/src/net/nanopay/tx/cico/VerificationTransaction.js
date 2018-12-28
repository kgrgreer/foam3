foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'VerificationTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'sendReverseNotification',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldTxn', javaType: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      if ( getStatus() != TransactionStatus.DECLINED ) return;
      DAO notificationDAO = ((DAO) x.get("notificationDAO"));
      Notification notification = new Notification();
      notification.setEmailIsEnabled(true);
      notification.setBody("Verification transaction id: " + getId() + " was declined.");
      notification.setNotificationType("Verification transaction declined");
      notification.setGroupId("support");
      notificationDAO.put(notification);

      `
    }
  ]
});
