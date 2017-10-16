foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Broker',
      name: 'brokerId'
    }
  ]
});