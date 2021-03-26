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
  package: 'net.nanopay.tx',
  name: 'ClearingTimeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
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
        return 'Clearing Time Transaction';
      },
      javaFactory: `
        return "Clearing Time Transaction";
      `
    },
    {
      class: 'DateTime',
      name: 'estimatedCompletionDate',
      createVisibility: 'HIDDEN',
      readVisibility: function(processDate) {
       return processDate ?
         foam.u2.DisplayMode.RO :
         foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function(processDate) {
       return processDate ?
         foam.u2.DisplayMode.RO :
         foam.u2.DisplayMode.HIDDEN;
      },
      section: 'transactionInformation',
      order: 410,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      tableWidth: 172
    },
    {
     class: 'DateTime',
     name: 'processDate',
     storageTransient: true,
     createVisibility: 'HIDDEN',
     readVisibility: function(processDate) {
      return processDate ?
        foam.u2.DisplayMode.RO :
        foam.u2.DisplayMode.HIDDEN;
     },
     updateVisibility: function(processDate) {
      return processDate ?
        foam.u2.DisplayMode.RO :
        foam.u2.DisplayMode.HIDDEN;
     }
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
      if ( other instanceof ClearingTimeTransaction ) {
        setEstimatedCompletionDate(((ClearingTimeTransaction) other).getEstimatedCompletionDate());
        setProcessDate(((ClearingTimeTransaction) other).getProcessDate());
        copyClearingTimesFrom(other);
      }
      `
    },

  ]
});
