foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'BaseSearchResponse',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesCall',
  
  documentation: 'Base class model for a search response from the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Int',
      name: 'httpStatusCode'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MetadataSearchResponse',
      name: 'metadata'
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
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.dowJones.Match',
      name: 'matchs'
    }
  ]
});
