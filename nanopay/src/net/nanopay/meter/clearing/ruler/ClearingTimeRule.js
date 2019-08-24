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
      visibility: 'HIDDEN'
    },
    {
      name: 'ruleGroup',
      value: 'ClearingTime',
      visibility: 'HIDDEN',
      permissionRequired: true
    },
    {
      name: 'operation',
      value: 'UPDATE',
      visibility: 'HIDDEN'
    },
    {
      name: 'after',
      value: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'predicate',
      javaFactory: 'return new DefaultClearingTimeRulePredicate();',
      visibility: 'HIDDEN'
    },
    {
      name: 'action',
      transient: true
    },
    {
      name: 'saveHistory',
      value: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'validity',
      value: 0,
      visibility: 'HIDDEN'
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
          },
          errorString: 'Clearing time duration must be greater than zero'
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
        transaction.getClearingTimes()
          .put(getClass().getSimpleName(), getDuration());
      `
    }
  ]
});
