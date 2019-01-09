foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'VerificationTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

  properties: [
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
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldTxn', javaType: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      if ( getStatus() != TransactionStatus.DECLINED && getStatus() != TransactionStatus.FAILED ) return;
      DAO notificationDAO = ((DAO) x.get("notificationDAO"));
      Notification notification = new Notification();
      notification.setEmailIsEnabled(true);
      notification.setBody("Verification transaction id: " + getId() + " was declined.");
      notification.setNotificationType("Verification transaction declined");
      notification.setGroupId("support");
      notificationDAO.put(notification);
      `
    },
    {
      name: 'createTransfers',
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
      javaReturns: 'Transfer[]',
      javaCode: `
      return new Transfer[0];
      `
    },
    {
      documentation: `verification transaction doesn't create any transfers`,
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
        return false;
      `
    },
    {
      documentation: `verification transaction doesn't create any transfers`,
      name: 'canReverseTransfer',
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
        return false;
      `
    }
  ]
});
