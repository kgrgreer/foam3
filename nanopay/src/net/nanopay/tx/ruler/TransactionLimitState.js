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
          name: 'rule',
          type: 'net.nanopay.tx.ruler.TransactionLimitRule'
        }
      ],
      javaCode: `
      long now   = System.currentTimeMillis();
      long delta = now - getLastActivity();

      setLastActivity(now);
      setLastSpentAmount(rule.updateLimitAmount(getLastSpentAmount(), delta));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`

        public synchronized boolean check(TransactionLimitRule rule, double amount) {
          update(rule);

          if ( amount <= rule.getLimit() - getLastSpentAmount() ) {
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
