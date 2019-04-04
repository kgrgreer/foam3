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
    },
    {
      class: 'net.nanopay.meter.compliance.dowJones.model.MatchPayload',
      name: 'payload',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'peid',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'revision',
      visibility: 'RO'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.RecordType',
      name: 'recordType',
      visibility: 'RO'
    }
  ]
});
