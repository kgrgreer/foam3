foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: 'This action implementation is responsible for for updating running limits' +
  'and reverting it back in case transaction did not go through.',

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'java.util.HashMap',
    'foam.nanos.ruler.Rule'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      Transaction txn = (Transaction) obj;
      HashMap hm = (HashMap) rule_.getCurrentLimits();
      Object id = rule_.getObjectToMap(txn, x);

      TransactionLimitState limitState = (TransactionLimitState) hm.get(id);
      if ( limitState == null ) {
        limitState = new TransactionLimitState();
        hm.put(id, limitState);
      }
      if ( ! limitState.check(rule_, txn.getAmount()) ) {
        throw new RuntimeException("LIMIT");
      }
          `
    },
    {
      name: 'applyReverseAction',
      javaCode: `
      // the method is called in case when there are two limits set (for sending and for receiving)
      // one limit was updated, but the second one threw "over limit", so we need to revert the first update

      Transaction txn = (Transaction) obj;
      HashMap hm = (HashMap) rule_.getCurrentLimits();

      Object key = rule_.getObjectToMap(txn, x);

      TransactionLimitState limitState = (TransactionLimitState) hm.get(key);

      if ( ! limitState.check(rule_, -txn.getAmount()) ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("was unable to update transaction limit for key " +
        key + ", transaction id: " + txn.getId() + 
        ", rule id: " + rule_.getId());
      }
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        net.nanopay.tx.ruler.TransactionLimitRule rule_;
        public TransactionLimitRuleAction(net.nanopay.tx.ruler.TransactionLimitRule rule) {
          rule_ = rule;
        }
        `);
      }
    }
  ]
});
