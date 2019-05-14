foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: 'This action implementation is responsible for for updating running limits' +
  'and reverting it back in case transaction did not go through.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'java.util.HashMap',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      Transaction txn = (Transaction) obj;
      DAO transactionDAO = (DAO) x.get("localTransactionDAO");
      Transaction oldTxn = (Transaction) transactionDAO.find_(x, obj);
      if ( ! txn.canTransfer(x, oldTxn) ) {
        return;
      }
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

      DAO transactionDAO = (DAO) x.get("localTransactionDAO");
      Transaction oldTxn = (Transaction) transactionDAO.find_(x, obj);
      if ( ! txn.canTransfer(x, oldTxn) ) {
        return;
      }
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
    },
    {
      name: 'canExecute',
      javaCode: `
      // TODO: add an actual implementation
      return true;
      `
    },
    {
      name: 'describe',
      javaCode: `
      // TODO: add an actual implementation
      return "";`
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
