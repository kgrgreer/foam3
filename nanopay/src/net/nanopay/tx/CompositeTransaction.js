foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompositeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  implements: [
    'net.nanopay.tx.AcceptAware'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.AcceptAware',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList',
    'java.util.Arrays'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      targetDAOKey: 'localTransactionDAO',
      name: 'current',
    },
    {
      class: 'FObjectArray',
      visibility: foam.u2.Visibility.RO,
      name: 'queued',
      of: 'net.nanopay.tx.model.Transaction',
      factory: function() {
        return [];
      },
      javaType: 'Transaction[]',
      javaFactory: `
        return new Transaction[0];
      `
    },
    {
      // Array of References
      class: 'StringArray',
      name: 'completed',
      javaFactory: `
        return new String[getQueued().length];
      `
    },
    {
      name: 'status',
      javaFactory: `
        Transaction[] transactions = transactions();
        for ( int i = 0; i < transactions.length; i++ ) {
          Transaction txn = transactions[i];
          if ( txn.getStatus() != TransactionStatus.COMPLETED ) {
            return txn.getStatus();
          }
        }
        return TransactionStatus.COMPLETED;
     `
    }
  ],

  methods: [
    {
      name: 'add',
      code: function add(transaction) {
        this.queued.push(transaction);
      },
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'transaction',
          javaType: 'Transaction'
        }
      ],
      javaCode: `
        Transaction[] queued = getQueued();
        synchronized (queued) {
          Transaction[] replacement = new Transaction[queued.length + 1];
          System.arraycopy(queued, 0, replacement, 0, queued.length);
          replacement[queued.length] = transaction;
          setQueued(replacement);
        }
        // Logger logger = (Logger) getX().get("logger");
        // logger.debug(this.getClass().getSimpleName(), "add", this);
      `
    },
    {
      name: 'remove',
      code: function remove(transaction) {
        this.queued = this.queued.filter(function(t) {
          return t.id != transaction.id;
        });
      },
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'transaction',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        Transaction[] queued = getQueued();
        synchronized (queued) {
          int index = -1;
          for ( int i = 0; i < queued.length; i++ ) {
            if ( queued[i].getId() == transaction.getId()) {
              index = i;
              break;
            }
          }
          if ( index > -1 ) {
            Transaction[] replacement = new Transaction[queued.length - 1];
            System.arraycopy(queued, 0, replacement, 0, index);
            if ( index < queued.length ) {
              System.arraycopy(queued, index + 1, replacement, index, queued.length - ( index + 1 ) );
            }
            setQueued(replacement);
          }
        }
      `
    },
    {
      name: 'next',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Transaction',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        Transaction txn = null;
        Transaction[] queued = getQueued();
        synchronized (queued) {
            if ( ! SafetyUtil.isEmpty(getCurrent()) ) {
            String[] completed = Arrays.copyOf(getCompleted(), getCompleted().length + 1);
            completed[completed.length -1] = getCurrent();
            setCompleted(completed);
            setCurrent(null);
          }
          if ( getQueued().length > 0 ) {
            txn = getQueued()[0];
            remove(x, txn);
            txn.setParent(getId());
            logger.debug(this.getClass().getSimpleName(), "put", "next queued", txn);
            DAO dao = (DAO) getX().get("localTransactionDAO");
            txn = (Transaction) dao.put(txn);
            txn = (Transaction) dao.find_(x, txn.getId());
            if ( txn.getStatus() == TransactionStatus.COMPLETED ) {
              // Digital -> Digital Transactions complete immediately, for example.
              setCurrent(txn.getId());
              txn = (Transaction) next(x);
              if ( txn == null ) {
                txn = last(x);
              }
            } else {
              setCurrent(txn.getId());
            }
          }
        }
        logger.debug(this.getClass().getSimpleName(), "put", "next return", txn);
        return txn;
`
    },
    {
      name: 'last',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Transaction',
      javaCode: `
        String[] completed = getCompleted();
        if ( completed.length > 0 ) {
          return (Transaction) ((DAO) getX().get("localTransactionDAO")).find(completed[completed.length -1]);
        }
        return null;
`
    },
    {
      name: 'createTranfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
        return new Transfer[] {};
      `
    },
    {
      name: 'transactions',
      javaReturns: 'Transaction[]',
      javaCode: `
        if ( getX().get("localTransactionDAO") == null ) {
          // NOTE: localTransactionDAO may not yet be available when
          // this DAO stack is being created during initial Transaction
          // loading.
          return new Transaction[0];
        }

        ArrayList<Transaction> list = java.util.Arrays.stream(getQueued()).collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        Transaction cur = findCurrent(getX());
        if ( cur != null ) {
          list.add(cur);
        }
        DAO dao = (DAO) getX().get("localTransactionDAO");
        String[] completed = getCompleted();
        for ( int i = 0; i < completed.length; i++ ) {
          Transaction txn = (Transaction) dao.find_(getX(), completed[i]);
          list.add(txn);
        }
        return list.toArray(new Transaction[list.size()]);
      `
    },
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
      ],
      javaCode: `
        // walk array and call accept
        Transaction[] queued = getQueued();
        for ( int i = 0; i < queued.length; i++ ) {
          Transaction t = queued[i];
          if ( t instanceof AcceptAware ) {
            ((AcceptAware)t).accept(x);
          } else if ( t instanceof CompositeTransaction ) {
            ((CompositeTransaction) t).accept(x);
          }
        }
`
    },
    {
      name: 'hasError',
      javaReturns: 'Boolean',
      javaCode: `
        for ( Transaction aTransaction : transactions() ) {
          if ( aTransaction instanceof ErrorTransaction ) {
            return true;
          }
          if ( aTransaction instanceof CompositeTransaction ) {
            return ((CompositeTransaction) aTransaction).hasError();
          }
        }
        return false;
      `
    },
    {
      name: 'toString',
      javaString: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(this.getClass().getSimpleName());
        sb.append("[");
        Transaction[] txns = transactions();
        for ( int i = 0; i < txns.length; i++ ) {
          Transaction t = txns[i];
          if ( t instanceof CompositeTransaction ) {
            sb.append(((CompositeTransaction) t).toString());
          } else {
            sb.append(txns[i]);
          }
          sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
      `
    }
  ]
});
