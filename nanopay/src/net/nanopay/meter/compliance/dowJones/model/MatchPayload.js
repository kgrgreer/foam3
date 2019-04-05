foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones.model',
  name: 'MatchPayload',

  documentation: 'Payload response data for a Match in the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'riskIcons',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'primaryName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'countryCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'title',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'subsidiary',
      visibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.model.MatchedName',
      name: 'matchedName',
      visibility: 'RO'
    },
    {
      class: 'Date',
      name: 'matchedDateOfBirth',
      visibility: 'RO'
    },
    {
      class: 'Array',
      name: 'datesOfBirth',
      visibility: 'RO'
    },
    {
      class: 'Array',
      name: 'countries',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'gender',
      visibility: 'RO'
    }
  ]
});
