foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'ServiceType',

  documentation: 'Type of service.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of service type.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of service type.'
    }
  ]
});
