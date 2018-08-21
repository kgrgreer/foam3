foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PlanTransaction',
  extends: 'net.nanopay.tx.CompositeTransaction',

  documentation: ``,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'expiry',
      class: 'DateTime'
    },
    {
      name: 'eta',
      class: 'Long'
    },
    {
      name: 'cost',
      class: 'Long'
    }
  ],

  methods: [
    {
      name: 'add',
      code: function add(transaction) {
        this.queued.push(transaction);
      },
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'transaction',
          javaType: 'Transaction'
        }
      ],
      javaCode: `
        super.add(x, transaction);
        this.recalculate(x);
`
    },
    {
      name: 'recalculate',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
      ],
      javaCode: `
        Transaction[] queued = getQueued();
        // calculate expiry, eta, cost
`
    },
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
      ],
      javaCode: `
      // walk array and call accept
        Transaction[] queued = getQueued();
`
    }
  ]
});
