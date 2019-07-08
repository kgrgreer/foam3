foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuote',

  documentation: `Select the best transactions and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
  ],

  properties: [
    {
      documentation: `Request quote on behalf of this transaction.`,
      name: 'requestTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      type: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plans',
      javaValue: 'new Transaction[] {}'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plan'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      networkTransient: true,
      documentation: 'helper property to be used during planning in order to avoid overuse of transaction.findSourceAccount'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      networkTransient: true,
      documentation: 'helper property to be used during planning in order to avoid overuse of transaction.findDestinationAccount'
    }
  ],

  methods: [
    {
      name: 'addPlan',
      args: [
        {
          name: 'plan',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      Transaction[] plans = new Transaction[getPlans().length + 1];
      if ( getPlans().length != 0 ) {
        System.arraycopy(getPlans(), 0, plans, 0, getPlans().length);
        plans[getPlans().length] = plan;
        setPlans(plans);
      } else {
        setPlans(new Transaction[] { plan });
      }
      `
    },
  ]
});
