foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'QuoteTransaction',
  extends: 'net.nanopay.tx.CompositeTransaction',

  documentation: `Select the best Plan and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'accepted',
      class: 'Boolean',
      value: false
    },
    {
      documentation: `Request quote on behalf of this transaction.`,
      name: 'requestTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      factory: function() {
        return this;
      },
      javaReturns: 'net.nanopay.tx.model.Transaction',
      javaFactory: `
        return this;
`
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
          of: 'TransactionPlan'
        },
      ],
      javaCode: `
       
`
    },
  ]
});
