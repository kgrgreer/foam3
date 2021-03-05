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
  package: 'net.nanopay.integration',
  name: 'ErrorCode',
  documentation: 'Error codes used for returning error cause information',

  tableColumns: [
    'id',
    'category',
    'abbreviation',
    'fullText'
  ],

  sections: [
    {
      name: 'errorCodeInformation'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      label: 'Code',
      alias: 'code',
      documentation: 'The error code number',
      section: 'errorCodeInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'category',
      documentation: 'the category of the error code',
      section: 'errorCodeInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'abbreviation',
      section: 'errorCodeInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'fullText',
      documentation: 'Full description of the error',
      section: 'errorCodeInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'summary',
      transient: true,
      getter: function() {
        return this.toSummary();
      },
      javaGetter: 'return toSummary();',
      section: 'errorCodeInformation',
      order: 50,
      gridColumns: 6
    },
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return "ERROR " + this.id + ": " + this.fullText;
      },
      javaCode: `
        return "ERROR " + getId() + ": " + getFullText();
      `
    }
  ]
});
