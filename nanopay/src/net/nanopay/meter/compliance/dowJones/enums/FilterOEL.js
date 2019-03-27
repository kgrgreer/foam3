foam.ENUM({
  package: 'net.nanopay.meter.compliance.dowjones.enums',
  name: 'FilterOEL',

  documentation: `Filter to restrict the search results by Other Exclusion Lists.`,

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
      label: 'Group ID (From Other Exclusion Lists'
    }
  ]
});
