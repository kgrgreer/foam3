foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'ServiceProvider',
  documentation: 'Service Provider information.',

  searchColumns: [],

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
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId'
    },
    {
      class: 'foam.core.FObjectProperty',
      name: 'fee',
      of: 'net.nanopay.tx.model.Fee'
    }
  ]
});
