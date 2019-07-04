foam.CLASS({
  package: 'net.nanopay.model',
  name: 'IdentificationType',

  documentation: 'Identification details for individuals.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
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
