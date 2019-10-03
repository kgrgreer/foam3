foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'ClearingTimeRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  javaImports: [
    'net.nanopay.meter.clearing.ClearingTimesTrait',
    'net.nanopay.meter.clearing.ruler.predicate.DefaultClearingTimeRulePredicate',
    'net.nanopay.tx.cico.COTransaction'
  ],

  tableColumns: [
    'id',
    'name',
    'duration'
  ],

  properties: [
    {
      name: 'name',
      tableWidth: 600
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      hidden: true
    },
    {
      name: 'ruleGroup',
      value: 'ClearingTime',
      hidden: true,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      name: 'operation',
      value: 'UPDATE',
      hidden: true
    },
    {
      name: 'after',
      value: false,
      hidden: true
    },
    {
      name: 'predicate',
      javaFactory: 'return new DefaultClearingTimeRulePredicate();',
      hidden: true
    },
    {
      name: 'action',
      transient: true
    },
    {
      name: 'saveHistory',
      value: false,
      hidden: true
    },
    {
      name: 'validity',
      value: 0,
      hidden: true
    },
    {
      class: 'Int',
      name: 'duration',
      value: 2,
      validationPredicates:  [
        {
          args: ['duration'],
          predicateFactory: function(e) {
            return e.GTE(net.nanopay.meter.clearing.ruler.ClearingTimeRule.DURATION, 0);
          },
          errorString: 'Clearing time duration must be zero or greater'
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
        if ( transaction instanceof ClearingTimesTrait ) {
          ((ClearingTimesTrait) transaction).getClearingTimes()
            .put(getClass().getSimpleName(), getDuration());
        }
      `
    }
  ]
});
