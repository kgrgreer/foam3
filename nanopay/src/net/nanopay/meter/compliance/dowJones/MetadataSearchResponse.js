foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'MetadataSearchResponse',

  documentation: 'Meta data about the search and results from Dow Jones.',

  properties: [
    {
      class: 'String',
      name: 'apiVersion',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'backendVersion',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'totalHits',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'hitsFrom',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'hitsTo',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'truncated',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'cachedResultsId',
      visibility: 'RO'
    }
  ]
});
