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
  package: 'net.nanopay.tx.planner',
  name: 'TransactionPlan',
  documentation: 'temporary storage of planned transactions before the user accepts them.',

  javaImports: [
    'net.nanopay.tx.ExpirySummaryTransactionLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction'
    },
    {
      class: 'Boolean',
      name: 'complete',
      value: true
    },
    {
      class: 'DateTime',
      name: 'expiry',
    },
  ],
  methods: [
    {
      name: 'setExpiryDate',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      Date date = new Date();
      for (TransactionLineItem line : txn.getLineItems()) {
        if ( line instanceof ExpirySummaryTransactionLineItem ) {
            date = ((ExpirySummaryTransactionLineItem) line).getExpiry();
            break;
        }
      }
      setExpiry(date);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionPlan (net.nanopay.tx.model.Transaction t) {
            setId(t.getId());
            setTransaction(t);
            setExpiryDate(t);
          }

          public TransactionPlan (net.nanopay.tx.model.Transaction t, Boolean complete) {
            setId(t.getId());
            setTransaction(t);
            setExpiryDate(t);
            setComplete(complete);
          }
        `);
      },
    }
  ]
});
