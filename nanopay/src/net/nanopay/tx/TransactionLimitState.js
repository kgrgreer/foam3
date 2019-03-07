foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLimitState',

  properties: [
    {
      class: 'Long',
      name: 'lastActivity',
      value: 0
    },
    {
      class: 'Double',
      name: 'lastAmount'
    }
  ],

  methods: [
    {
      name: 'update',
      args: [
        {
          name: 'rule',
          type: 'net.nanopay.tx.TransactionLimitRule'
        }
      ],
      javaCode: `
      long now   = System.currentTimeMillis();
      long delta = now - getLastActivity();;

      setLastActivity(now);
      setLastAmount(rule.updateLimitAmount(getLastAmount(), delta));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionLimitState(net.nanopay.tx.TransactionLimitRule rule) {
            setLastAmount(rule.getLimit());
          }

          public synchronized boolean check(TransactionLimitRule rule, double amount) {
            update(rule);
        
            if ( amount <= getLastAmount() ) {
              setLastAmount(getLastAmount() - amount);
              return true;
            }
        
            return false;
          }
        `);
      }
    }
  ]
});
