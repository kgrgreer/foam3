foam.CLASS({
  package: 'net.nanopay.model',
  name: 'ThresholdResolve',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Threshold',
      name: 'threshold'
    }
  ]
});