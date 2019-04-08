foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'PersonNameSearchRequest',
  extends: 'net.nanopay.meter.compliance.dowJones.BaseSearchRequest',

  documentation: `Extends BaseSearchRequest for a person name search in the Dow Jones Risk Database`,

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.SearchType',
      name: 'searchType',
      documentation: 'The desired tolerance for the search.'
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'The search text to search the First Name field (and equivalents) in Person profiles.'
    },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'The search text to search the Middle Name field (and equivalents) in Person profiles.'
    },
    {
      class: 'String',
      name: 'surName',
      documentation: 'The search text to search the Surname field (and equivalents) in Person profiles.'
    },
    {
      class: 'Date',
      name: 'dateOfBirth',
      documentation: 'The date of birth of the Person.'
    },
    {
      class: 'Boolean',
      name: 'dateOfBirthStrict',
      documentation: 'Indicates whether or not the dateOfBirth should be strictly matched (as against with some tolerance).'
    },
    {
      class: 'Boolean',
      name: 'excludeDeceased',
      documentation: 'Indicates whether or not to exclude deceased Person records.'
    }
  ]
});
