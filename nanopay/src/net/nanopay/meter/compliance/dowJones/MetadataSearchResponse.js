foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'MetadataSearchResponse',

  documentation: 'Meta data about the search and results from Dow Jones.',

  properties: [
    {
      class: 'String',
      name: 'apiVersion',
      visibility: 'RO',
      documentation: 'Current Dow Jones API Version'
    },
    {
      class: 'String',
      name: 'backendVersion',
      visibility: 'RO',
      documentation: 'Current Dow Jones Backend Version'
    },
    {
      class: 'Int',
      name: 'totalHits',
      visibility: 'RO',
      documentation: 'The total number of records that matched the request'
    },
    {
      class: 'Int',
      name: 'hitsFrom',
      visibility: 'RO',
      documentation: 'The starting index of the records returned in this response'
    },
    {
      class: 'Int',
      name: 'hitsTo',
      visibility: 'RO',
      documentation: 'The ending index of the records returned in this response'
    },
    {
      class: 'Boolean',
      name: 'truncated',
      visibility: 'RO',
      documentation: 'Indicates whether it is a truncated search'
    },
    {
      class: 'String',
      name: 'cachedResultsId',
      visibility: 'RO',
      documentation: 'ID pertaining to the cached results from the response'
    }
  ]
});
