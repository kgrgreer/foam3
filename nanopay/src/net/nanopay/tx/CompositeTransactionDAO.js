/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompositeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
 ],

  // methods: [
  //   {
  //     name: 'put_',
  //     args: [
  //       {
  //         name: 'x',
  //         of: 'foam.core.X'
  //       },
  //       {
  //         name: 'obj',
  //         of: 'foam.core.FObject'
  //       }
  //     ],
  //     javaReturns: 'Transaction',
  //     javaCode: `
  //      if ( obj instanceof CompositeTransaction ) {
  //          CompositeTransaction comp = (CompositeTransaction) obj;
  //          Transaction parent = comp.findParent(x);
  //          if ( parent == null ) {
  //            Transaction next = comp.next(x);
  //            // Save updated CompositeTransaction itself
  //            getDelegate().put_(x, comp);
  //            return next;
  //          }
  //       } else {
  //         Transaction txn = (Transaction) obj;
  //         Transaction old = (Transaction) getDelegate().find_(x, obj);
  //         if ( old != null && old.getStatus() != TransactionStatus.COMPLETED &&
  //              txn.getStatus() == TransactionStatus.COMPLETED ) {
  //            Transaction parent = txn.findParent(x);
  //            if ( parent != null && parent instanceof CompositeTransaction ) {
  //              Transaction next = ((CompositeTransaction)parent).next(x);
  //              // Save updated CompositeTransaction itself
  //              getDelegate().put_(x, parent);
  //              return next;
  //            } else {
  //              return (Transaction) getDelegate().put_(x, txn);
  //            }
  //         }
  //       }
  //       return (Transaction) getDelegate().put_(x, obj);
  //     `
  //   },
  // ]
});
