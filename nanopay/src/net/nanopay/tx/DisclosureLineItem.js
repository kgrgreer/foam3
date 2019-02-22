foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DisclosureLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      documentation: 'Disclosure Text',
      name: 'text',
      class: 'String',
      view: { class: 'net.nanopay.ui.DisclosureView', data: this }
    },
  ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'old',
          type: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'nu',
          type: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'reverse',
          type: 'Boolean'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        return new Transfer[0];
      `
    },
  ]
});
