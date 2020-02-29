foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ComplianceTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Transaction to be created specifically for compliance purposes. stays in pending until compliance is passed`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;',
    },
    {
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;',
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['COMPLETED', 'COMPLETED'],
            ['CANCELLED', 'CANCELLED'],
            ['DECLINED', 'DECLINED'],
          ];
        }
       return ['No status to choose'];
      }
    }
  ],

  methods: [
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
    }
  ]
});
