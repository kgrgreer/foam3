foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'ClientDowJonesService',

  implements: [
    'net.nanopay.meter.compliance.dowJones.DowJones'
  ],

  javaImports: [
    'net.nanopay.meter.compliance.dowJones.BaseSearchResponse'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.meter.compliance.dowJones.DowJones',
      name: 'delegate'
    }
  ]
});
