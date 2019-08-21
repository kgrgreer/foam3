foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PurposeGroup',

  documentation: 'Purpose group for Indian payments.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of purpose group.'
    }
  ]
});
