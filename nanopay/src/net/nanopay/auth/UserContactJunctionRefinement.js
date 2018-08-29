foam.CLASS({
  refines: 'net.nanopay.auth.UserContactJunction',
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
