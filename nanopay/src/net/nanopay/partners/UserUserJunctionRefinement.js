foam.CLASS({
  refines: 'foam.nanos.auth.UserUserJunction',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'partnerOneInfo',
      documentation: 'User associated to partner relationship.',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'partnerTwoInfo',
      documentation: 'User associated to partner relationship.',
      storageTransient: true
    }
  ]
});
