foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'ClientAscendantFXReportsService',

  implements: [
    'net.nanopay.fx.ascendantfx.AscendantFXReportsService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.fx.ascendantfx.AscendantFXReportsService',
      name: 'delegate'
    }
  ]
});
