foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'Amount',

  properties: [
    {
      class: 'String',
      name: 'Unit',
      documentation: `
        The id of the Unit that the amount is in.
      `,
      required: true
    },
    {
      class: 'Long',
      name: 'quantity',
      documentation: `
        The quantity of the Unit
      `,
      required: true
    }
  ]
});
