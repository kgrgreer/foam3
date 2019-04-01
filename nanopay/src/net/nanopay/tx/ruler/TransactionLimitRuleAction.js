foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'java.util.HashMap',
    'foam.nanos.ruler.Rule'
  ],
  // properties: [
  //   {
  //     class: 'FObjectProperty',
  //     of: 'net.nanopay.tx.ruler.AbstractTransactionLimitRule',
  //     name: 'rule'
  //   }
  // ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      Transaction txn = (Transaction) obj;
      HashMap hm = (HashMap) rule_.getHm();
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
      Transaction txn = (Transaction) obj;
      HashMap hm = (HashMap) rule_.getHm();

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
        net.nanopay.tx.ruler.AbstractTransactionLimitRule rule_;
        public TransactionLimitRuleAction(net.nanopay.tx.ruler.AbstractTransactionLimitRule rule) {
          rule_ = rule;
        }
        `);
      }
    }
  ]
});
