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
  name: 'CompletedTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On transition to completed reset status of children.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);
      Transaction txn = (Transaction) getDelegate().put_(x, obj);
      if ( txn.getLifecycleState() == LifecycleState.ACTIVE && txn.getStatus() == TransactionStatus.COMPLETED && (
          ( oldTxn == null ) ||
          ( oldTxn != null && oldTxn.getStatus() != TransactionStatus.COMPLETED ) ||
          ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.COMPLETED && oldTxn.getLifecycleState() != LifecycleState.ACTIVE )
      )){
        DAO children = ((DAO) x.get("localTransactionDAO")).inX(x).where(AND(
          EQ(Transaction.PARENT, txn.getId()),
          EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED)));
        for ( Object o : ((ArraySink) children.select(new ArraySink())).getArray() ) {
          Transaction child = (Transaction) ((Transaction) o).fclone();
          if( child.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED){
            child.setStatus(child.getInitialStatus());
            children.put_(getX(), child);
          }
          /**
           * need to use the put_ override because of the newly added transaction.status permissionRequired: true property
           * we call put_ with the DAO context rather than the calling context instead
           * this is because the user in the calling context may not have permission to update
           * all neccessary properties
           */

        }
      }
      return txn;
      `
    }
  ],
});
