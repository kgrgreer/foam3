foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'Match',

  documentation: 'Matched profile from Dow Jones Risk Database.',

  properties: [
    {
      class: 'String',
      name: 'score',
      documentation: 'Indicates the match score'
    },
    {
      class: 'String',
      name: 'matchType',
      documentation: 'Indicates the type of match achieved'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MatchPayload',
      name: 'payload',
      documentation: 'Container for the response payload'
    },
    {
      class: 'String',
      name: 'peid',
      documentation: 'The ID of the matched record (the Person/Entity ID)'
    },
    {
      class: 'String',
      name: 'revision',
      documentation: 'the revision timestamp of the record in the format YYYY-MM-DD HH:MM:SS'
    },
    {
      class: 'String',
      name: 'recordType',
      documentation: 'The record type, one of PERSON or ENTITY'
    }
  ]
});
