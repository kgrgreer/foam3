/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'COTransaction',
  extends: 'net.nanopay.tx.ClearingTimeTransaction',

  implements: [
    'net.nanopay.tx.ValueMovementTransaction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.Logger',
    'foam.core.ValidationException',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
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
            ['PAUSED', 'PAUSED'],
            ['PENDING', 'PENDING']
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
          logger.error("Destination bank account must be verified");
          throw new ValidationException("Destination bank account must be verified");
        }

        // Check transaction status and lifecycleState
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn != null
          && ( oldTxn.getStatus().equals(TransactionStatus.DECLINED)
            || oldTxn.getStatus().equals(TransactionStatus.COMPLETED) )
          && ! getStatus().equals(TransactionStatus.DECLINED)
          && oldTxn.getLifecycleState() != LifecycleState.PENDING
        ) {
          logger.error("Unable to update COTransaction, if transaction status is completed or declined. Transaction id: " + getId());
          throw new ValidationException("Unable to update COTransaction, if transaction status is completed or declined. Transaction id: " + getId());
        }

        if ( ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.SENT) && (getStatus() == TransactionStatus.PAUSED))
                            throw new ValidationException("Unable to pause COTransaction, it is already in Sent Status! Transaction id: " + getId());
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
        if ( oldTxn == null ) { // TODO rethink this as its not really correct.
          if ( getStatus() == TransactionStatus.COMPLETED ) return true;
          if ( getStatus() == TransactionStatus.PENDING ) {
            if ( SafetyUtil.isEmpty(getParent()) ) return true;
            return findParent(x).getStatus() == TransactionStatus.COMPLETED;
          }
          return false;
        }

        // Reverse funds that were taken out of digital accounts when old status was pending or sent
        if ( getStage() == 2 && (oldTxn.getStatus() == TransactionStatus.PENDING || oldTxn.getStatus() == TransactionStatus.SENT) ) {
          return true;
        }

        // Cannot transfer when updating status != PENDING.
        if ( ! (getStatus() == TransactionStatus.PENDING || getStatus() == TransactionStatus.COMPLETED) ) return false;

        // Updating status=PENDING, can transfer when transitioning from
        // PENDING_PARENT_COMPLETED or SCHEDULED.
        return oldTxn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED
          || oldTxn.getStatus() == TransactionStatus.SCHEDULED
          || oldTxn.getStatus() == TransactionStatus.PENDING;
      `
    },
    {
      name: 'getStage',
      documentation: 'Intertrust transactions have multi-stage transfers, 0 on pending, 1 when completed.',
      type: 'Long',
      javaCode: `
        if ( getStatus() == TransactionStatus.COMPLETED ) {
          return 1;
        } else if ( getStatus() == TransactionStatus.CANCELLED ||
            getStatus() == TransactionStatus.DECLINED ||
            getStatus() == TransactionStatus.FAILED ) {
          return 2;
        }
        return 0;
      `,
    }
 ]
});
