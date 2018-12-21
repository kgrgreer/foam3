foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BusinessType',

  documentation: 'Proprietor details for business/businesses',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of business type.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of business type.'
    }
  ]
});
