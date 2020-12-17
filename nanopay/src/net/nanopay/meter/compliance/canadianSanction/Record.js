/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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

  tableColumns: [
    'id',
    'Country',
    'LastName',
    'GivenName',
    'DateOfBirth',
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'Country',
      javaSetter: `
        Country_ = sanitize(val);
        CountryIsSet_ = true;
      `
    },
    {
      class: 'String',
      name: 'Entity',
      javaSetter: `
        Entity_ = sanitize(val);
        EntityIsSet_ = true;
      `
    },
    {
      class: 'String',
      name: 'Title'
    },
    {
      class: 'String',
      name: 'LastName',
      javaSetter: `
        LastName_ = sanitize(val).toUpperCase();
        LastNameIsSet_ = true;
      `
    },
    {
      class: 'String',
      name: 'GivenName',
      javaSetter: `
        GivenName_ = sanitize(val).toUpperCase();
        GivenNameIsSet_ = true;
      `
    },
    {
      class: 'String',
      name: 'Aliases',
      javaSetter: `
        Aliases_ = sanitize(val);
        AliasesIsSet_ = true;
      `
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
           * Sanitize string
           */
          protected String sanitize(String str) {
            // Get rid of no-break space (\xA0) because it impedes string
            // comparison against regular space character.
            return str
              .replace('\u00A0', ' ')
              .trim();
          }
        `);
      },
    },
  ]
});
