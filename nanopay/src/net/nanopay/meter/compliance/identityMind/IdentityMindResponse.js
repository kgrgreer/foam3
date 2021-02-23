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
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'IdentityMindResponse',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  tableColumns: [
    'id',
    'entityId',
    'apiName',
    'frp',
    'res'
  ],

  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.meter.compliance.ComplianceValidationStatus'
  ],

  sections: [
    {
      name: 'responseInformation'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50,
      section: 'responseInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'entityType',
      section: 'responseInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'Name of DAO that contains the entity (eg. userDAO)',
      section: 'responseInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'Object',
      name: 'entityId',
      tableWidth: 100,
      section: 'responseInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'Int',
      name: 'statusCode',
      tableWidth: 80,
      section: 'responseInformation',
      order: 50,
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      section: 'responseInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'apiName',
      documentation: 'The name of the IdentityMind API that was requested.',
      section: 'responseInformation',
      order: 70,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'error_message',
      section: 'responseInformation',
      order: 80,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'user',
      documentation: 'Current reputation of the user.',
      label: 'User reputation',
      section: 'responseInformation',
      order: 90,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'upr',
      documentation: 'Previous reputation of the user.',
      label: 'Previous reputation',
      section: 'responseInformation',
      order: 110,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'frp',
      documentation: 'Result of fraud evaluation.',
      label: 'Fraud evaluation result',
      section: 'responseInformation',
      order: 120,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'frn',
      documentation: 'Name of the fraud rule that fired.',
      label: 'Fraud rule name',
      section: 'responseInformation',
      order: 130,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'frd',
      documentation: 'Description of the fraud rule that fired.',
      label: 'Fraud rule description',
      section: 'responseInformation',
      order: 140
    },
    {
      class: 'String',
      name: 'arpr',
      documentation: 'Result of automated review evaluation.',
      label: 'Automated review',
      section: 'responseInformation',
      order: 150,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'arpid',
      documentation: 'Id of the automated review rule that fired.',
      label: 'Automated review rule id',
      section: 'responseInformation',
      order: 160,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'arpd',
      documentation: 'Description of the automated review rule that fired.',
      label: 'Automated review rule description',
      section: 'responseInformation',
      order: 170
    },
    {
      class: 'String',
      name: 'tid',
      documentation: 'Current transaction id.',
      label: 'IDM transaction id',
      section: 'responseInformation',
      order: 180,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'erd',
      documentation: `Description of the reason for the user's reputation.`,
      label: 'User reputation description',
      section: 'responseInformation',
      order: 190,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'res',
      documentation: 'Result of policy evaluation. Combines the result of fraud and automated review evaluations.',
      label: 'Result of policy evaluation',
      section: 'responseInformation',
      order: 200,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'rcd',
      documentation: 'The set of result codes from the evaluation of the current transaction.',
      label: 'Result codes',
      section: 'responseInformation',
      order: 210,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'requestJson',
      section: 'responseInformation',
      order: 220
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA',
      name: 'ednaScoreCard',
      label: 'eDNA Score Card',
      section: 'responseInformation',
      order: 230
    },
  ],

  methods: [
    {
      name: 'getComplianceValidationStatus',
      type: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      javaCode: `
        String result = ! SafetyUtil.isEmpty(getRes()) ? getRes() : getFrp();
        switch (result) {
          case "ACCEPT":
            return ComplianceValidationStatus.VALIDATED;
          case "DENY":
            return ComplianceValidationStatus.REJECTED;
          case "MANUAL_REVIEW":
            return ComplianceValidationStatus.INVESTIGATING;
          default:
            return null;
        }
      `
    }
  ]
});
