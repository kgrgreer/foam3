foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'ClientDowJonesSearchService',

  implements: [
    'net.nanopay.meter.compliance.dowJones.DowJonesSearch'
  ],

  javaImports: [
    'net.nanopay.meter.compliance.dowJones.BaseSearchResponse'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesSearch',
      name: 'delegate'
    }
  ]
});
