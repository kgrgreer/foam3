foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'Device',

  tableColumns: ['name', 'type', 'serialNumber', 'status'],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.DeviceType',
      name: 'type',
      required: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.DeviceStatus',
      name: 'status'
    },
    {
      class: 'String',
      name: 'serialNumber',
      label: 'Serial No.',
      required: true
    },
    {
      class: 'String',
      name: 'password'
    }
  ]
});
