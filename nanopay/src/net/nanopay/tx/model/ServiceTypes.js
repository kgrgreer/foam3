foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'ServiceTypes',

  documentation: 'Type of service.',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      required: true,
      documentation: 'Name of service type.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of service type.'
    }
  ]
});
