foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLimitRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Pre-defined limit for transactions.',

  javaImports: [
    'java.util.HashMap',
    'java.util.Map',
    'foam.nanos.ruler.RuleAction',
    'foam.core.FObject',
    'net.nanopay.tx.model.Transaction',
    'foam.core.X',
    'net.nanopay.account.Account',
    'net.nanopay.tx.TransactionLimitState',
    'foam.nanos.ruler.RuleEngine',
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
      documentation: 'Amount that account balance should not exceed'
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
      class: 'Date',
      name: 'expiry',
      documentation: 'Date when running balance should be reset.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      documentation: 'Spid to configure transaction limit.'
    },
    {
      class: 'Map',
      name: 'hm',
      javaFactory: `
      return new java.util.HashMap<Long, TransactionLimitState>();
      `
    },
    {
      name: 'daoKey',
      value: 'transactionDAO'
    },
    {
      name: 'action',
      javaFactory: `
      return new RuleAction() {
        @Override
        public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) {
          TransactionLimitRule rule = TransactionLimitRule.this;
          Transaction txn = (Transaction) obj;
          HashMap hm = (HashMap)getHm();
          Account account = getSend() ? txn.findSourceAccount(x) : txn.findDestinationAccount(x);

          TransactionLimitState limitState = (TransactionLimitState) hm.get(account.getId());
          if ( limitState == null ) {
            limitState = new TransactionLimitState(rule);
            hm.put(account.getId(), limitState);
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
      Double d =  Math.floor(amount + msPeriod * amount / getTempPeriod());
        if ( d > getLimit() ) {
        d = getLimit();
      }
      return d;
      `
    }
  ]
});
