foam.CLASS({
  package: 'net.nanopay.model',
  name: 'IdentificationType',

  documentation: 'Identification details for individuals.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of identification type.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of identification type.'
    }
  ]
});
