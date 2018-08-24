foam.CLASS({
  package: 'net.nanopay.partners',
  name: 'PartnerJunction',
  extends: 'foam.nanos.auth.UserUserJunction',

  documentation: `
    A named reference to the junction object between two users used to implement
    the partners feature.
  `,

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
