foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PlanTransaction',
  extends: 'net.nanopay.tx.CompositeTransaction',

  documentation: ``,

  implements: [
    'net.nanopay.tx.AcceptAware'
  ],

  javaImports: [
    'net.nanopay.tx.AcceptAware',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'accepted',
      class: 'Boolean',
      value: false
    },
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
      name: 'accept',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
      ],
      javaCode: `
        this.setAccepted(true);
        super.accept(x);
`
    },
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
`
    }
  ]
});
