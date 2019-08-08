foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitState',
  documentation: 'The class stores the limit itself and date when that limit was set.' +
  'Responsible for updating the limit as well.' +
  'The object is stored in a hash map on the TransactionLimitRule' +
  'along with the object that it stores limit for(account, business, user..)',


  properties: [
    {
      class: 'Long',
      name: 'lastActivity',
      value: 0
    },
    {
      class: 'Double',
      name: 'lastSpentAmount'
    }
  ],

  methods: [
    {
      name: 'update',
      args: [
        {
          name: 'limit',
          type: 'Double'
        },
        {
          name: 'period',
          type: 'net.nanopay.util.Frequency'
        }
      ],
      javaCode: `
      long now   = System.currentTimeMillis();
      long delta = now - getLastActivity();

      setLastActivity(now);
      setLastSpentAmount(Math.max(getLastSpentAmount() - delta * limit / period.getMs(), 0));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`

        public synchronized boolean check(double limit, net.nanopay.util.Frequency period, double amount) {
          update(limit, period);

          if ( amount <= limit - getLastSpentAmount() ) {
            return true;
          }
          return false;
        }

        public synchronized void updateLastSpentAmount(Double amount) {
          setLastSpentAmount(Math.max(0, getLastSpentAmount() + amount));
        }
        `);
      }
    }
  ]
});
