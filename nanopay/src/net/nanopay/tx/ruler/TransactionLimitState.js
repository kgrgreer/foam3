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
      class: 'Long',
      name: 'spent'
    }
  ],

  methods: [
    {
      name: 'update',
      args: [
        {
          name: 'limit',
          type: 'Long'
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
      setSpent(Math.max(getSpent() - delta * limit / period.getMs(), 0));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`

        public synchronized boolean check(Long limit, net.nanopay.util.Frequency period, Long amount) {
          update(limit, period);

          if ( amount <= limit - getSpent() ) {
            return true;
          }
          return false;
        }

        public synchronized void updateSpent(Long amount) {
          setSpent(Math.max(0, getSpent() + amount));
        }
        `);
      }
    }
  ]
});
