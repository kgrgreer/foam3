foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompositeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'foam.core.FObject',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      // NOTE: using array, rather than relationship as order is important.
      class: 'FObjectArray',
      visibility: foam.u2.Visibility.RO,
      name: 'transactions',
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
      documentation: `Index of Active/Current Transaction`,
      class: 'Long',
      name: 'cursor',
      value: 0,
      visibility: foam.u2.Visibility.RO
    }
  ],

  methods: [
    {
      name: 'add',
      code: function add(transaction) {
        this.transactions.push(transaction);
      },
      args: [
        {
          name: 'transaction',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        Transaction[] current = getTransactions();
        synchronized (current) {
          Transaction[] replacement = new net.nanopay.tx.model.Transaction[current.length + 1];
          System.arraycopy(current, 0, replacement, 0, current.length);
          replacement[current.length] = transaction;
          setTransactions(replacement);
        }
      `
    },
    {
      name: 'remove',
      code: function remove(transaction) {
        this.transactions = this.transactions.filter(function(t) {
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
        Transaction[] current = getTransactions();
        synchronized (current) {
          int index = -1;
          for ( int i = 0; i < current.length; i++ ) {
            if ( current[i].getId() == transaction.getId()) {
              index = i;
              break;
            }
          }
          if ( index > -1 ) {
            Transaction[] replacement = new net.nanopay.tx.model.Transaction[current.length - 1];
            System.arraycopy(current, 0, replacement, 0, index);
            if ( index < current.length ) {
              System.arraycopy(current, index + 1, replacement, index, current.length - ( index + 1 ) );
            }
            setTransactions(replacement);
          }
        }
      `
    }
  ]
});

