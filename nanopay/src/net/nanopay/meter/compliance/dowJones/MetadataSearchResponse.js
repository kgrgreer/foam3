foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'MetadataSearchResponse',

  documentation: 'Meta data about the search and results from Dow Jones.',

  properties: [
    {
      class: 'String',
      name: 'apiVersion',
      documentation: 'Current Dow Jones API Version'
    },
    {
      class: 'String',
      name: 'backendVersion',
      documentation: 'Current Dow Jones Backend Version'
    },
    {
      class: 'Int',
      name: 'totalHits',
      documentation: 'The total number of records that matched the request'
    },
    {
      class: 'Int',
      name: 'hitsFrom',
      documentation: 'The starting index of the records returned in this response'
    },
    {
      class: 'Int',
      name: 'hitsTo',
      documentation: 'The ending index of the records returned in this response'
    },
    {
      class: 'Boolean',
      name: 'truncated',
      documentation: 'Indicates whether it is a truncated search'
    },
    {
      class: 'String',
      name: 'cachedResultsId',
      documentation: 'ID pertaining to the cached results from the response'
    }
  ]
});
