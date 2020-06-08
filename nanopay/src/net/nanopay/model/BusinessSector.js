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

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      label: 'Business Sector',
      documentation: 'Name of business sector.'
    },
    {
      class: 'Long',
      name: 'parent'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function(x) {
        return this.name;
      },
    },
  ]
});
