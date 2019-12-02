foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'CITransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
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
          return [
            'choose status',
            ['PENDING_PARENT_COMPLETED', 'UNPAUSE'],
            ['CANCELLED', 'CANCELLED']
          ];
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
      copyClearingTimesFrom(other);
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
      Logger logger = (Logger) x.get("logger");

      if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findSourceAccount(x)).getStatus())) {
        logger.error("Bank account must be verified");
        throw new RuntimeException("Bank account must be verified");
      }
      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && ( oldTxn.getStatus().equals(TransactionStatus.DECLINED) ||
        oldTxn.getStatus().equals(TransactionStatus.COMPLETED) ) && ! getStatus().equals(TransactionStatus.DECLINED) ) {
        logger.error("Unable to update CITransaction, if transaction status is accepted or declined. Transaction id: " + getId());
        throw new RuntimeException("Unable to update CITransaction, if transaction status is accepted or declined. Transaction id: " + getId());
      }
      `
    }
  ]
});
