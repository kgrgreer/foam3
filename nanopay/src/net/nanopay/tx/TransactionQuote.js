foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuote',

  documentation: `Select the best Plan and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      documentation: `Request quote on behalf of this transaction.`,
      name: 'requestTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      javaReturns: 'net.nanopay.tx.model.Transaction',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.TransactionPlan',
      name: 'plan'
    },
    {
      class: 'Array',
      of: 'net.nanopay.tx.TransactionPlan',
      name: 'plans'
    },
  ],
  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'plan',
          javaType: 'net.nanopay.tx.TransactionPlan'
        },
      ],
      javaCode: `
       setPlan(plan);
       /* TODO: delete all other plans */
`
    },
  ]
});
