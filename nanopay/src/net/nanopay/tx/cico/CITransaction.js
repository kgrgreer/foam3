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
  name: 'CITransaction',
  extends: 'net.nanopay.tx.ClearingTimeTransaction',

  implements: [
    'net.nanopay.tx.ValueMovementTransaction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'foam.core.ValidationException',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.nanos.auth.LifecycleState'
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
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
        super.validate(x);
        Logger logger = (Logger) x.get("logger");

        // Check source account
        if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findSourceAccount(x)).getStatus())) {
          logger.error("Source bank account must be verified");
          throw new ValidationException("Source bank account must be verified");
        }

        // Check transaction status and lifecycleState
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn != null
          && ( oldTxn.getStatus() == TransactionStatus.DECLINED
            || oldTxn.getStatus() == TransactionStatus.COMPLETED )
          && getStatus() != TransactionStatus.DECLINED
          && oldTxn.getLifecycleState() != LifecycleState.PENDING
        ) {
          logger.error("Unable to update CITransaction, if transaction status is completed or declined. Transaction id: " + getId());
          throw new ValidationException("Unable to update CITransaction, if transaction status is completed or declined. Transaction id: " + getId());
        }

        if ( ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.SENT) && (getStatus() == TransactionStatus.PAUSED))
                    throw new ValidationException("Unable to pause CITransaction, it is already in Sent Status! Transaction id: " + getId());

      `
    },
    {
      name: 'getStage',
      documentation: 'Intertrust transactions have multi-stage transfers, 0 on pending, 1 when completed.',
      type: 'Long',
      javaCode: `
        if ( getStatus() == TransactionStatus.COMPLETED ) {
          return 1;
        }
        return 0;
      `,
    }
  ]
});
