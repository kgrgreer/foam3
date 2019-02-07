foam.CLASS({
  package: 'net.nanopay.meter.compliance.canadianSanction',
  name: 'Record',

  documentation: `Represents record in the Canadian sanction list dataset.
    All property names except 'id' are capitalized to match with
    field names of the record data in the dataset.

    Eg.,

      <record>
        <Country>..</Country>
        <Entity>..</Entity>
        <Title>..</Title>
        <LastName>..</LastName>
        <GivenName>..</GivenName>
        <Aliases>..</Aliases>
        <DateOfBirth>..</DateOfBirth>
        <Schedule>..</Schedule>
        <Item>..</Item>
      </record>
    `,

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
      name: 'LastName',
      javaSetter: `
        LastName_ = val.toUpperCase();
        LastNameIsSet_ = true;
      `
    },
    {
      class: 'String',
      name: 'GivenName',
      javaSetter: `
        GivenName_ = val.toUpperCase();
        GivenNameIsSet_ = true;
      `
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
