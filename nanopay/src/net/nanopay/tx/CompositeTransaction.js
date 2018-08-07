foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompositeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List'
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
      class: 'Array',
      name: 'completed',
      javaType: 'Long[]',
      javaFactory: `
        return new Long[getQueued().length];
      `
    },
    {
      name: 'status',
      javaFactory: `
// Logger logger = (Logger) getX().get("logger");
// System.out.println("logger: "+logger);
// logger.info("localTransactionDAO: ", getX().get("localTransactionDAO"));
//         Transaction txn = (Transaction) findCurrent(getX());
//         if ( txn != null ) {
//           return txn.getStatus();
//         } else {
//           return TransactionStatus.COMPLETED;
//         }
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
      javaCode: `
        if ( getCurrent() != 0 ) {
          Long[] completed = java.util.Arrays.copyOf(getCompleted(), getCompleted().length + 1);
          completed[completed.length -1] = getCurrent();
          setCompleted(completed);
          setCurrent(0);
        }
        if ( getQueued().length > 0 ) {
          Transaction txn = getQueued()[0];
          remove(txn);
          txn.setParent(getId());
          DAO dao = (DAO) getX().get("localTransactionDAO");
          txn = (Transaction) dao.put(txn);
          txn = (Transaction) dao.find_(getX(), txn.getId());
          if ( txn.getStatus() == TransactionStatus.COMPLETED ) {
            // Digital -> Digital Transactions complete immediately, for example.
            next();
          } else {
            setCurrent(txn.getId());
          }
        }
`
    }
  ]
});

