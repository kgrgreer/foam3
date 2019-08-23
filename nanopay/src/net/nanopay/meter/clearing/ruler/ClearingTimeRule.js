foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'ClearingTimeRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  javaImports: [
    'net.nanopay.meter.clearing.ruler.predicate.DefaultClearingTimeRulePredicate',
    'net.nanopay.tx.cico.COTransaction'
  ],

  properties: [
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: 'RO'
    },
    {
      name: 'ruleGroup',
      value: 'ClearingTime',
      visibility: 'RO',
      permissionRequired: true
    },
    {
      name: 'operation',
      value: 'UPDATE',
      visibility: 'RO'
    },
    {
      name: 'after',
      value: false,
      visibility: 'RO'
    },
    {
      name: 'predicate',
      javaFactory: 'return new DefaultClearingTimeRulePredicate();',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'duration',
      value: 2,
      validationPredicates:  [
        {
          args: ['duration'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.meter.clearing.ruler.ClearingTimeRule.DURATION, 0);
          }
        }
      ]
    }
  ],

  methods: [
    {
      name: 'findAccount',
      type: 'net.nanopay.account.Account',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        return transaction instanceof COTransaction
          ? transaction.findDestinationAccount(x)
          : transaction.findSourceAccount(x);
      `
    },
    {
      name: 'incrClearingTime',
      args: [
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        int clearingTime = transaction.getClearingTime() + getDuration();
        transaction.setClearingTime(clearingTime);
      `
    }
  ]
});
