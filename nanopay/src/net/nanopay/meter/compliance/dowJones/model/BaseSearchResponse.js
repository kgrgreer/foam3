foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones.model',
  name: 'BaseSearchResponse',
  extends: 'net.nanopay.meter.compliance.dowJones.model.DowJonesCall',

  documentation: 'Base class model for a search response from the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Int',
      name: 'httpStatusCode',
      visibility: 'RO'
    },
    {
      class: 'net.nanopay.meter.compliance.dowJones.model.MetadataSearchResponse',
      name: 'metadata',
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
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.dowJones.model.Match',
      name: 'matchs',
      visibility: 'RO'
    }
  ]
});
