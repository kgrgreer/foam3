foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesResponse',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesCall',

  documentation: 'Base class model for a search response from the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'Date',
      name: 'searchDate'
    },
    {
      class: 'String',
      name: 'searchType'
    },
    {
      class: 'String',
      name: 'nameSearched'
    },
    {
      class: 'Int',
      name: 'totalMatches'
    },
    {
      class: 'Int',
      name: 'httpStatusCode',
      documentation: 'HTTP Status Code retrieved from the HTTP GET request to the Dow Jones API'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MetadataSearchResponse',
      name: 'metadata',
      documentation: 'Metadata retrieved from the head response data'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponseBody',
      name: 'responseBody',
      documentation: 'Body retreived from the body response data'
    }
  ]
});
