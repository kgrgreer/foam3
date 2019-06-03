foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `This action implementation is responsible for for updating running limits
  and reverting it back in case transaction did not go through.

  `,

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
      Object id = rule_.getObjectToMap(txn, x);

      TransactionLimitState limitState = getLimitState(id);
      if ( ! limitState.check(rule_, txn.getAmount()) ) {
        throw new RuntimeException("LIMIT");
      }
      agent.submit(x1 -> limitState.updateLastSpentAmount(Double.valueOf(txn.getAmount())), "ppppp");
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

        public TransactionLimitState getLimitState(Object id) {
          TransactionLimitState state = (TransactionLimitState) rule_.getCurrentLimits().get(id);
          if ( state == null ) {
            state = new TransactionLimitState();
            rule_.getCurrentLimits().put(id, state);
          }
          return state;
        }
        `);
      }
    }
  ]
});
