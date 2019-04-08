foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'MatchPayload',

  documentation: 'Payload response data for a Match in the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'riskIcons'
    },
    {
      class: 'String',
      name: 'primaryName'
    },
    {
      class: 'String',
      name: 'countryCode'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'Boolean',
      name: 'subsidiary'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MatchedName',
      name: 'matchedName'
    },
    {
      class: 'Date',
      name: 'matchedDateOfBirth'
    },
    {
      class: 'Array',
      name: 'datesOfBirth'
    },
    {
      class: 'Array',
      name: 'countries'
    },
    {
      class: 'String',
      name: 'gender'
    }
  ]
});
