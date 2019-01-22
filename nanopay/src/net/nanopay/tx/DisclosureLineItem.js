foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DisclosureLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  requires: [
    'net.nanopay.disclosure.Disclosure',
  ],
  
  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.disclosure.Disclosure',
      name: 'disclosure',
      label: 'Disclosure',
      factory: function() {
        return this.Disclosure.create();
      },
      documentation: 'Disclosure to be displayed'
    },
  ],

  methods: [
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
        {
          name: 'reverse',
          javaType: 'Boolean'
        }
      ],
      javaReturns: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        return new Transfer[0];
      `
    },
  ]
});
