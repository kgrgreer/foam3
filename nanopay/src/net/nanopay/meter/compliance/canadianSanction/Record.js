foam.CLASS({
  package: 'net.nanopay.meter.compliance.canadianSanction',
  name: 'Record',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'Country'
    },
    {
      class: 'String',
      name: 'Entity'
    },
    {
      class: 'String',
      name: 'Title'
    },
    {
      class: 'String',
      name: 'LastName'
    },
    {
      class: 'String',
      name: 'GivenName'
    },
    {
      class: 'String',
      name: 'Aliases'
    },
    {
      class: 'String',
      name: 'DateOfBirth'
    },
    {
      class: 'String',
      name: 'Schedule'
    },
    {
      class: 'Short',
      name: 'Item'
    }
  ],

  axioms: [
    {
      buildJavaClass: function (cls) {
        cls.extras.push(`
          /**
           * Storing the checksum of Canadian sanction list dataset for
           * determining if the data is stale and thus need reloading when
           * running {@code ReloadCanadianSanctionsListCron}.
           */
          public static String datasetChecksum = "";
        `);
      },
    },
  ]
});
