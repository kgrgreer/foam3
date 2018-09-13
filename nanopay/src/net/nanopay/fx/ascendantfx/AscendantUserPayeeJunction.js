foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantUserPayeeJunction',

  documentation: 'Mapping for Ascendant Organization ID and PayeeID and nanoPay UserID',

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
      class: 'String',
      name: 'orgId',
      documentation: 'AscendantFX Organization ID'
    },
    {
      class: 'String',
      name: 'ascendantPayeeId',
      documentation: 'PayeeId returned after AddPayee to AscendantFX.'
    },
  ]
});
