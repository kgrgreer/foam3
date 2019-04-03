foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones.model',
  name: 'Match',

  description: 'Matched profile from Dow Jones Risk Database.',

  properties: [
    {
      class: 'Float',
      name: 'score',
      visibility: 'RO'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.MatchType',
      name: 'matchType',
      visibility: 'RO'
    }
  ]
});
