foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ContactJunction',
  extends: 'foam.nanos.auth.UserUserJunction',

  documentation: `
    A named reference to the junction object between two users used to implement
    the contacts feature.
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'contactInfo',
      documentation: `
        Public information about the contact. Used by the contacts relationship.
      `,
      storageTransient: true
    }
  ]
});
