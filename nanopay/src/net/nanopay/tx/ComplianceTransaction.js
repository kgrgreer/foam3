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
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.findRoot(this.__subContext__).then(obj => {
          return obj ? obj.toSummary() : this.toSummary();
        });
      }
    },
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
    },
    {
      name: 'calculateErrorCode',
      javaCode: `
        if ( getStatus() == TransactionStatus.DECLINED ) {
          return 991l;
        }

        return 0;
      `
    }
  ]
});
