foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuote',

  documentation: `Select the best Plan and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionPlan'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      documentation: `Request quote on behalf of this transaction.`,
      name: 'requestTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      javaReturns: 'net.nanopay.tx.model.Transaction',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionPlan',
      name: 'plans',
      javaValue: 'new TransactionPlan[] {}'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.TransactionPlan',
      name: 'plan'
    }
  ],

  methods: [
    {
      name: 'addPlan',
      args: [
        {
          name: 'plan',
          javaType: 'TransactionPlan'
        }
      ],
      javaCode: `
      TransactionPlan[] plans = new TransactionPlan[getPlans().length + 1];
      if ( getPlans().length != 0 ) {
        System.arraycopy(getPlans(), 0, plans, 0, getPlans().length);
        plans[getPlans().length] = plan;
        setPlans(plans);
      } else {
        setPlans(new TransactionPlan[] { plan });
      }
      `
    },
  ]
});
