foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BusinessSector',

  documentation: 'General section in the economy within' +
      ' which groups of companies can be categorized.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of business sector.'
    },
    {
      class: 'Long',
      name: 'parent'
    }
  ]
});
