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
  package: 'net.nanopay.model',
  name: 'BusinessSector',

  documentation: 'General section in the economy within' +
      ' which groups of companies can be categorized.',

  tableColumns: [
    'id', 'name', 'code', 'parent', 'countryId'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      tableWidth: 500,
      label: 'Business Sector',
      documentation: 'Name of business sector.'
    },
    {
      class: 'String',
      name: 'code',
      label: 'Business Sector Code',
      documentation: 'business sector code.'
    },
    {
      class: 'Long',
      name: 'parent'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryId',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: 'Select a Country'
        });
      }
    },
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function(x) {
        return this.name;
      },
      javaCode: `
        return getName();
      `
    },
  ]
});
