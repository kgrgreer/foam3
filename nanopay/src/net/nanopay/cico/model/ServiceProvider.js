foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'ServiceProvider',

  documentation: 'Service Provider information.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'String',
      name: 'apiBaseUrl'
    }
  ]
});