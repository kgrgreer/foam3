foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'note',
    },
    {
      name: 'amount',
      class: 'Long',
    },
    {
      name: 'quantity',
      class: 'Long',
      value: 1
    },
    {
      documentation: `Show Transaction Line Item class name - to distinguish sub-classes.`,
      class: 'String',
      name: 'type',
      transient: true,
      visibility: foam.u2.Visibility.RO,
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: `
        return getClass().getSimpleName();
`
    }
  ],

  methods: [
    {
      name: 'toString',
      javaReturns: true,
      javaCode: `
`
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'old',
          javaType: 'Transaction'
        },
        {
          name: 'nu',
          javaType: 'Transaction'
        },
      ],
      javaReturns: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        if ( getAmount() != 0 ) {
          return new Transfer[];
        }
        return new Transfer [] {
          new Transfer.Builder(x).setAccount(nu.getSourceAccount()).setAmount(-getAmount()).build(),
          new Transfer.Builder(x).setAccount(nu.getDestinationAccount()).setAmount(getAmount()).build()
        };
      `
    },
  ]
});
