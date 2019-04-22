foam.ENUM({
  package: 'net.nanopay.meter.compliance.dowJones.enums',
  name: 'FilterSL',

  documentation: 'Filter to restrict the search results by Sanctions Lists.',

  values: [
    {
      name: 'ANY',
      label: 'Any'
    },
    {
      name: 'ANY_CURRENT',
      label: 'Any Current'
    },
    {
      name: 'GROUP_ID',
      label: 'Group ID (from Sanctions Lists)'
    }
  ]
});
