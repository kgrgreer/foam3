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
  package: 'net.nanopay.fx',
  name: 'KotakFxTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

   javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

   documentation: `Kotak transaction that stays in pending until a manual transaction rate is entered`,

   properties: [
    {
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;',
    },
    {
      name: 'status',
      javaFactory: 'return TransactionStatus.PENDING;'
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
      return false;
      `
     },
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
       setFxRate(((KotakFxTransaction) other).getFxRate());
       setFxQuoteId(((KotakFxTransaction) other).getFxQuoteId());
       `
     }
  ]
});
