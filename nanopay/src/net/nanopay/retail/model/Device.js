foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'Device',
  ids: ['serialNumber'],

  tableColumns: ['name', 'type', 'serialNumber', 'status'],

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active',
      required: true
    },
    {
      class: 'String',
      name: 'serialNumber',
      label: 'Serial No.',
      required: true
    },
    {
      class: 'Double',
      name: 'password',
      required: true
    },
    {
      class: 'String',
      name: 'certificateId'
    },
    {
      class: 'Boolean',
      name: 'resetPassword'
    },
    {
      class: 'String',
      name: 'status'
    }
  ]
});