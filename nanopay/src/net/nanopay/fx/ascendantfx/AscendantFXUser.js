
foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXUser',

  documentation: 'Mapping for nanoPay User to AscendantFX Payee',

  import: [
    'net.nanopay.fx.ascendantfx.AscendantFXHoldingAccount'
  ],

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
      name: 'name',
      documentation: 'Name to identify user'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.ascendantfx.AscendantFXHoldingAccount',
      name: 'holdingAccounts',
      javaFactory: 'return new AscendantFXHoldingAccount[0];',
      documentation: 'Ascendant Holding Accounts.'
    },
  ]
});
