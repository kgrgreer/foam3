foam.CLASS({
  package: 'net.nanopay.liquidity.model',
  name: 'ThresholdResolve',

  documentation: 'A threshold resolve reflects the creation of balance alerts. Used to not create multiple alerts on the same threshold.',

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