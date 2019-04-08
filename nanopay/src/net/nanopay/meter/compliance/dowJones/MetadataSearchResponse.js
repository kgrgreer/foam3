foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'MetadataSearchResponse',

  documentation: 'Meta data about the search and results from Dow Jones.',

  properties: [
    {
      class: 'String',
      name: 'apiVersion'
    },
    {
      class: 'String',
      name: 'backendVersion'
    },
    {
      class: 'Int',
      name: 'totalHits'
    },
    {
      class: 'Int',
      name: 'hitsFrom'
    },
    {
      class: 'Int',
      name: 'hitsTo'
    },
    {
      class: 'Boolean',
      name: 'truncated'
    },
    {
      class: 'String',
      name: 'cachedResultsId'
    }
  ]
});
