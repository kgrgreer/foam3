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
    'foam.nanos.ruler.TestedRule',
    'java.util.HashMap',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.AbliiTransaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      if ( agency instanceof TestedRule) {
        ((TestedRule)agency).setName("transactionLimits");
      }
      Transaction txn = (Transaction) obj;
      DAO transactionDAO = (DAO) x.get("localTransactionDAO");
      Transaction oldTxn = (Transaction) transactionDAO.find_(x, obj);
      // if ( ! txn.canTransfer(x, oldTxn) ) {
      //   return;
      // }
      if (! (txn instanceof AbliiTransaction) && ( ! txn.canTransfer(x, oldTxn) )) {
        return;
      }
      Object id = rule_.getObjectToMap(txn, x);

      TransactionLimitState limitState = getLimitState(id);
      if ( agency instanceof TestedRule ) {
        TransactionLimitProbeInfo info = new TransactionLimitProbeInfo();
        info.setRemainingLimit(rule_.getLimit() - limitState.getLastSpentAmount());
        info.setMessage("Your remaining limit is " + (rule_.getLimit() - limitState.getLastSpentAmount()) );
        ((TestedRule)agency).setProbeInfo(info);
      }
      if ( ! limitState.check(rule_, txn.getAmount()) ) {
        throw new RuntimeException("Your limit is exceeded");
      }
      agency.submit(x, x1 -> limitState.updateLastSpentAmount(Double.valueOf(txn.getAmount())), "Your transaciton will be proccessed.");
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
