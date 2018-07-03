foam.CLASS({
  refines: 'foam.nanos.auth.UserUserJunction',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'partnerOneInfo',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'partnerTwoInfo',
      storageTransient: true
    }
  ]
});

