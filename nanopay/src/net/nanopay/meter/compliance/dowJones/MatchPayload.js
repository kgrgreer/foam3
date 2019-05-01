foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'MatchPayload',

  documentation: 'Payload response data for a Match in the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'riskIcons',
      documentation: 'Array containing one or more risk indicators for the profile'
    },
    {
      class: 'String',
      name: 'primaryName',
      documentation: 'The primary name of the profile'
    },
    {
      class: 'String',
      name: 'countryCode',
      documentation: 'The country code associated with the profile'
    },
    {
      class: 'String',
      name: 'title',
      documentation: 'Text for the title column'
    },
    {
      class: 'Boolean',
      name: 'subsidiary',
      documentation: 'Indicates whether or not the matched profile is a subsidiary'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MatchedName',
      name: 'matchedName',
      documentation: 'The exact name that was matched in the search'
    },
    {
      class: 'String',
      name: 'matchedDateOfBirth',
      documentation: 'The date of birth value that matched with the highest score (if any)'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'datesOfBirth',
      documentation: 'Array for one or more dates of birth associated with the profile'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'countries',
      documentation: 'Array for one or more countries associated with the matched profile'
    },
    {
      class: 'String',
      name: 'gender',
      documentation: 'Indicates the gender of the profile'
    }
  ]
});
