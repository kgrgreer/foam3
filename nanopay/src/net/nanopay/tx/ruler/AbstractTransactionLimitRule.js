foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'AbstractTransactionLimitRule',
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
      of: 'net.nanopay.model.Frequency',
      name: 'period',
      value: 'DAILY',
      documentation: 'Transaction limit time frame. (Day, Week etc.)'
    },
    {
      class: 'Map',
      name: 'hm',
      //transient: true,
      javaFactory: `
      return new java.util.HashMap<Object, TransactionLimitState>();
      `
    },
    {
      name: 'daoKey',
      value: 'transactionDAO'
    },
    {
      name: 'action',
      javaFactory: `
      return new TransactionLimitRuleAction(this);
      `,
    },
    {
      name: 'predicate',
      javaFactory: `
      //temporary until Mlang.REF is added
      return foam.mlang.MLang.EQ(DOT(NEW_OBJ, net.nanopay.tx.model.Transaction.IS_QUOTED), false);
      //return EQ("true", "true");
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
      return Math.max(amount - msPeriod * getLimit() / getPeriod().getMs(), 0);
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
      AbstractTransactionLimitRule ret = (AbstractTransactionLimitRule) rule.fclone();
      if ( ret.getSend() != getSend() ) {
        throw new RuntimeException("send property cannot be changed");
      }
      ret.clearAction();
      ret.setHm(getHm());
      return ret;
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        // finds an object to map. E.g., if limit is set per account, the method will return source/destination account'
        //when set per business, will return business.
        public abstract Object getObjectToMap(net.nanopay.tx.model.Transaction txn, foam.core.X x);
        `);
      }
    }
  ]
});
