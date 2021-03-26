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
  name: 'InterTrustTransaction',
  extends: 'net.nanopay.tx.ClearingTimeTransaction',
  documentation: ` This transaction is for sending between two accounts that are represented by different trustAccounts. extending transactions must fulfill eft and actual sending functions`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'foam.core.ValidationException',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.nanos.auth.LifecycleState',
    'foam.util.SafetyUtil',
  ],
  properties: [
    {
      name: 'name',
      factory: function() {
        return 'InterTrust Transaction';
      },
      javaFactory: `
        return "InterTrust Transaction";
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


        Account source = findSourceAccount(x);
        Account destination = findDestinationAccount(x);

        // source and destination must be digitals
        if ( ! (source instanceof DigitalAccount) )
          throw new ValidationException("Source must be digital");
        if ( ! (destination instanceof DigitalAccount) )
          throw new ValidationException("Destination must be digital");


        // Transaction must be between different trusts
        TrustAccount sourceTrust = ((DigitalAccount) source).findTrustAccount(x);
        TrustAccount destinationTrust = ((DigitalAccount) destination).findTrustAccount(x);
        if (SafetyUtil.equals(sourceTrust.getId(),destinationTrust.getId()))
          throw new ValidationException(sourceTrust.getId()+"  "+destinationTrust.getId()+" This transaction can only be used between different trust accounts. ");

        // Check transaction status and lifecycleState
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn != null
          && ( oldTxn.getStatus().equals(TransactionStatus.DECLINED)
            || oldTxn.getStatus().equals(TransactionStatus.COMPLETED) )
          && ! getStatus().equals(TransactionStatus.DECLINED)
          && oldTxn.getLifecycleState() != LifecycleState.PENDING
        ) {
          logger.error("Unable to update InterTrustTransaction, if transaction status is completed or declined. Transaction id: " + getId());
          throw new ValidationException("Unable to update CITransaction, if transaction status is completed or declined. Transaction id: " + getId());
        }
      `
    },
    {
      name: 'getStage',
      documentation: 'Intertrust transactions have multi-stage transfers, 0 on pending, 1 when completed.',
      type: 'Long',
      javaCode: `
        if ( getStatus() == TransactionStatus.COMPLETED)
          return 1;
        return 0;
      `,
    },
    {
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
        /* Allow transfers when:
        1. (stage 1) status=COMPLETED and lifecycleState=ACTIVE and old txn not in this combo.
        2. (stage 0) status=PENDING and lifecycleState=ACTIVE, old txn was in PPC, paused or scheduled.
        */
        if ( (getStatus() == TransactionStatus.COMPLETED) && (oldTxn == null) )
          throw new ValidationException("InterTrustTransaction Impossible state reached.");

        if (
          ( getStatus() == TransactionStatus.COMPLETED
          && getLifecycleState() == LifecycleState.ACTIVE
          && ( oldTxn.getStatus() != TransactionStatus.COMPLETED
            || oldTxn.getLifecycleState() != LifecycleState.ACTIVE )
          ) ||
          ( getStatus() == TransactionStatus.PENDING && (
            oldTxn == null
            || oldTxn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED
            || oldTxn.getStatus() == TransactionStatus.PAUSED
            || oldTxn.getStatus() == TransactionStatus.SCHEDULED)
          )
        ) return true;

        return false;
      `
    },
  ]
});
