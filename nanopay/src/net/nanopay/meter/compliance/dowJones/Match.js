foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'Match',

  description: 'Matched profile from Dow Jones Risk Database.',

  properties: [
    {
      class: 'Float',
      name: 'score'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.MatchType',
      name: 'matchType'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MatchPayload',
      name: 'payload'
    },
    {
      class: 'String',
      name: 'peid'
    },
    {
      class: 'String',
      name: 'revision'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.RecordType',
      name: 'recordType'
    }
  ]
});
