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
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  documentation: 'Adjusts the system digital balance amounts to account for the amount that payment-ops would of manually transfered.',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;'
    },
  ],

  methods: [
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
        return oldTxn != null && oldTxn.getStatus() != TransactionStatus.COMPLETED && getStatus() == TransactionStatus.COMPLETED;
      `
    }
  ]
});
