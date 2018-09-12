
foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXUser',

  documentation: 'Mapping for nanoPay User to AscendantFX Payee',

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
      name: 'ascendantPayeeId',
      documentation: 'PayeeId returned after AddPayee to AscendantFX.'
    },
    {
      class: 'String',
      name: 'ascendantOrgId',
      documentation: 'AscendantFX Organization ID'
    }
  ]
});
