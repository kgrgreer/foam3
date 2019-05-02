foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'AbstractTransactionLimitRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Abstract class for transaction limits, never to be instantiated. Meant to be extended' +
  'by models that would provide logic for getObjectToMap method. See example: AccountTransactionLimitRule.',

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
      documentation: 'Amount that running limit should not exceed'
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      documentation: 'Transaction operation, ' +
      'determines whether limit is set for sending money or reciving money.'
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
      name: 'currentLimits',
      javaFactory: `
      return new java.util.HashMap<Object, TransactionLimitState>();
      `,
      documentation: 'Stores map of objects and current running limits.'
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
      return foam.mlang.MLang.EQ(DOT(NEW_OBJ, net.nanopay.tx.model.Transaction.IS_QUOTED), false);
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
      ret.setCurrentLimits(getCurrentLimits());
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
