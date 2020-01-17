foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'COTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.util.SafetyUtil'
  ],
  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Cash Out';
      },
      javaFactory: `
        return "Cash Out";
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
      name: 'institutionNumber',
      class: 'String',
      visibility: 'Hidden'
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
            ['SENT', 'SENT'],
            ['COMPLETED', 'COMPLETED'],
            ['CANCELLED', 'CANCELLED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING_PARENT_COMPLETED ) {
          return [
            'choose status',
            ['PAUSED', 'PAUSED']
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

        // Check destination account
        Account account = findDestinationAccount(x);
        if ( account instanceof BankAccount && BankAccountStatus.UNVERIFIED.equals(((BankAccount)findDestinationAccount(x)).getStatus())) {
          logger.error("Bank account must be verified");
          throw new RuntimeException("Bank account must be verified");
        }

        // Check transaction status and lifecycleState
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn != null
          && ( oldTxn.getStatus().equals(TransactionStatus.DECLINED)
            || oldTxn.getStatus().equals(TransactionStatus.COMPLETED) )
          && ! getStatus().equals(TransactionStatus.DECLINED)
          && oldTxn.getLifecycleState() != LifecycleState.PENDING
        ) {
          logger.error("Unable to update COTransaction, if transaction status is accepted or declined. Transaction id: " + getId());
          throw new RuntimeException("Unable to update COTransaction, if transaction status is accepted or declined. Transaction id: " + getId());
        }
      `
    },
    {
      documentation: `return true when status change is such that normal Transfers should be executed (applied)`,
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
        // Cannot transfer when not ACTIVE.
        if ( getLifecycleState() != LifecycleState.ACTIVE ) {
          return false;
        }

        // New transaction, can transfer when
        // 1. COMPLETED
        // 2. PENDING and has no parent or parent is COMPLETED.
        if ( oldTxn == null ) {
          if ( getStatus() == TransactionStatus.COMPLETED ) return true;
          if ( getStatus() == TransactionStatus.PENDING ) {
            if ( SafetyUtil.isEmpty(getParent()) ) return true;
            return findParent(x).getStatus() == TransactionStatus.COMPLETED;
          }
          return false;
        }

        // Cannot transfer when updating status != PENDING.
        if ( getStatus() != TransactionStatus.PENDING ) return false;

        // Updating status=PENDING, can transfer when transitioning from
        // PENDING_PARENT_COMPLETED, PAUSED or SCHEDULED.
        return oldTxn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED
          || oldTxn.getStatus() == TransactionStatus.PAUSED
          || oldTxn.getStatus() == TransactionStatus.SCHEDULED;
      `
    }
 ]
});
