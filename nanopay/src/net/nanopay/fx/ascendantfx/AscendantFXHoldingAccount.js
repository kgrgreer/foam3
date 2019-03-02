
foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXHoldingAccount',

  documentation: 'Model for AscendantFX Holding Account',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'orgId',
      documentation: 'AscendantFX Organization ID'
    },
    {
      class: 'String',
      name: 'accountNumber'
    },
    {
      class: 'String',
      name: 'currency'
    }
  ]
});
