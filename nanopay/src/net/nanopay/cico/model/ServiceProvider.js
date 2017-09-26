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

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Broker',
  targetModel: 'foam.nanos.auth.Country',
  forwardName: 'countries',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Broker',
  targetModel: 'net.nanopay.model.Currency',
  forwardName: 'currencies',
  inverseName: 'owner'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Broker',
  targetModel: 'net.nanopay.tx.model.Fee',
  forwardName: 'fees',
  inverseName: 'owner'
});
