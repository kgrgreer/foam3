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
    'net.nanopay.tx.TransactionLimitState'
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
      class: 'Currency',
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
        public void applyAction(X x, FObject obj, FObject oldObj) {
          TransactionLimitRule rule = TransactionLimitRule.this;
          Transaction txn = (Transaction) obj;
          HashMap hm = (HashMap)getHm();
          Account sourceAccount = txn.findSourceAccount(x);

          TransactionLimitState limitState = (TransactionLimitState)hm.get(sourceAccount.getId());
          if ( limitState == null ) {
            limitState = new TransactionLimitState(rule);
            hm.put(sourceAccount.getId(), limitState);
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
      return foam.mlang.MLang.INSTANCE_OF(net.nanopay.tx.model.Transaction.class);
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
      Double returned = Math.floor(amount + msPeriod * amount / getTempPeriod());
      if ( returned > getLimit() ) {
        return getLimit();
      }
      return returned;
      `
    }
  ]
});
