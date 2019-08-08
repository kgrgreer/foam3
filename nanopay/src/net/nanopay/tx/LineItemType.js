foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LineItemType',
  implements: ['foam.nanos.auth.EnabledAware'],

  documentation: 'Type of service rendered',

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 50,
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
    },
    {
      class: 'String',
      name: 'name',
      required: true,
      documentation: 'Name of service or good classification.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of service or good.'
    },
    {
      class: 'String',
      name: 'taxCode'
    }
  ]
});
