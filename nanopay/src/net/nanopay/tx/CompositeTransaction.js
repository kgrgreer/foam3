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
  name: 'CompositeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'addNext',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        Transaction tx = this;
        Transaction [] t = tx.getNext();
        txn.setInitialStatus(txn.getStatus());
        txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
        if ( t == null ) {
          return;
        }
        int size = t.length;
        Transaction [] t2 = new Transaction [size+1];
        System.arraycopy(t,0,t2,0,t.length);
        t2[t2.length-1] = txn;
        tx.setNext(t2);
      `
    }
  ]
})
