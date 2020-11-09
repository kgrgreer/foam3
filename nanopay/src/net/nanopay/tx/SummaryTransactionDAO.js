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
  name: 'SummaryTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.*',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.order.Comparator',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummaryTransaction',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected class DecoratedSink extends foam.dao.ProxySink
          {
            public DecoratedSink(X x, Sink delegate)
            {
              super(x, delegate);
              if (delegate == null)
                delegate = new ArraySink();
            }

            @Override
            public void put(Object obj, foam.core.Detachable sub)
            {
              if (obj instanceof SummaryTransaction) {
                obj = doChainCalculation((SummaryTransaction) obj);
                getDelegate().put(obj, sub);
              }
            }
          }

          public SummaryTransactionDAO(X x, DAO delegate)
          {
            super(x, delegate);
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if( obj != null && obj instanceof SummaryTransaction ) {
          obj = doChainCalculation((SummaryTransaction) obj);
        }
        return obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink decoratedSink = new DecoratedSink(x, sink);
        getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
        return sink;
      `
    },
    {
      name: 'put_',
      javaCode: `
        obj = super.put_(x, obj);
        if (obj instanceof SummaryTransaction) {
          Transaction txn = (Transaction) obj.fclone();
          txn.getState(x);
          return txn;
        }
        return obj;
      `
    },
    {
      name: 'doChainCalculation',
      visibility: 'protected',
      type: 'FObject',
      args: [
        { type: 'net.nanopay.tx.SummaryTransaction', name: 't' }
      ],
      javaCode: `
          Transaction tx = (Transaction) t.fclone();
          tx.getState(getX());
          return tx;
      `
    }
  ]
});
