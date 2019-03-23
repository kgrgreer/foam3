foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLimitRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Pre-defined limit for transactions.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.RuleAction',
    'foam.nanos.ruler.RuleEngine',
    'java.util.HashMap',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],


  properties: [
    {
      class: 'String',
      name: 'ruleGroup',
      value: 'transactionLimits'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      value: 'CREATE'
    },
    {
      class: 'Double',
      name: 'limit',
      documentation: 'Amount that running balance should not exceed'
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      documentation: 'Transaction limit operation.'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.Frequency',
      name: 'period',
      documentation: 'Transaction limit time frame. (Day, Week etc.)'
    },
    {
      class: 'Long',
      name: 'tempPeriod',
      documentation: 'ms'
    },
    {
      class: 'Map',
      name: 'hm',
      transient: true,
      javaFactory: `
      return new java.util.HashMap<Long, TransactionLimitState>();
      `
    },
    {
      name: 'daoKey',
      javaFactory: 'return "transactionDAO";'
    },
    {
      name: 'action',
      javaFactory: `
      return new RuleAction() {
        @Override
        public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
          TransactionLimitRule rule = TransactionLimitRule.this;
          Transaction txn = (Transaction) obj;
          HashMap hm = (HashMap) getHm();
          long id = getMappedId(txn, x);

          TransactionLimitState limitState = (TransactionLimitState) hm.get(id);
          if ( limitState == null ) {
            limitState = new TransactionLimitState();
            hm.put(id, limitState);
          }
          if ( ! limitState.check(rule, txn.getAmount()) ) {
            throw new RuntimeException("LIMIT");
          }
        }
      };`,
    },
    {
      name: 'predicate',
      javaFactory: `
      //temporary until Mlang.REF is added
      return foam.mlang.MLang.EQ(DOT(NEW_OBJ, foam.mlang.MLang.INSTANCE_OF(net.nanopay.tx.model.Transaction.class)), true);
      `
    }
  ],

  methods: [
    {
      name: 'updateLimitAmount',
      args: [
        {
          name: 'amount',
          type: 'Double'
        },
        {
          name: 'msPeriod',
          type: 'Long'
        }
      ],
      type: 'Double',
      javaCode: `
      return Math.max(amount - msPeriod * getLimit() / getTempPeriod(), 0);
      `
    },
    {
      name: 'updateRule',
      type: 'foam.nanos.ruler.Rule',
      args: [
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        }
      ],
      javaCode: `
      TransactionLimitRule ret = (TransactionLimitRule) rule.fclone();
      if ( ret.getSend() != getSend() ) {
        throw new RuntimeException("send property cannot be changed");
      }
      ret.clearAction();
      ret.setHm(getHm());
      return ret;`
    },
    {
      name: 'reverseAction',
      javaCode: `
      Transaction txn = (Transaction) obj;
      HashMap hm = (HashMap)getHm();

      long id = getMappedId(txn, x);

      TransactionLimitState limitState = (TransactionLimitState) hm.get(id);
      if ( ! limitState.check(this, -txn.getAmount()) ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("was unable to update transaction limit for account " +
        id + ", transaction id: " + txn.getId() + 
        ", rule id: " + getId());
      }
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        // finds an id to map. E.g., if limit is set per account, the method will return source/destination account'
        //when set per business, will return business id.
        public abstract long getMappedId(net.nanopay.tx.model.Transaction txn, foam.core.X x);
        `);
      }
    }
  ]
});
