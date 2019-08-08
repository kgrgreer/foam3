foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesResponseBody',

  documentation: 'Response body within DowJonesResponse',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.dowJones.Match',
      name: 'matches',
      visibility: 'RO',
      documentation: 'Array of match records returned from the request'
    }
  ]
});
