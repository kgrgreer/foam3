foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones.model',
  name: 'EntityNameSearch',
  extends: 'net.nanopay.meter.compliance.dowJones.model.BaseSearch',

  documentation: `Extends BaseSearch to search Entity profiles in the Risk and Compliance database.`,

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.SearchType',
      name: 'searchType',
      documentation: 'The desired tolerance for the search.'
    },
    {
      class: 'String',
      name: 'entityName',
      documentation: 'The search text to search the Entity Name in the Entity profiles'
    }
  ]
});
