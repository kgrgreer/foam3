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
  package: 'net.nanopay.meter.compliance',
  name: 'UserComplianceRefine',
  refines: 'foam.nanos.auth.User',

  implements: [
    'net.nanopay.meter.compliance.ComplianceAware'
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      value: net.nanopay.admin.model.ComplianceStatus.NOTREQUESTED,
      documentation: 'Operations approval status for user.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      section: 'complianceInformation',
      order: 30,
      gridColumns: 6,
      sheetsOutput: true
    },
    {
      class: 'DateTime',
      name: 'dateCompliancePassed',
      documentation: 'Date compliance was passed',
      section: 'complianceInformation',
      order: 31,
      gridColumns: 6
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'AccountComplianceRefine',
  refines: 'net.nanopay.bank.BankAccount',

  implements: [
    'net.nanopay.meter.compliance.ComplianceAware'
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      section: 'complianceInformation',
      order: 10,
      gridColumns: 6,
      documentation: 'Operations approval status for bank account.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      sheetsOutput: true
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'BeneficialOwnerComplianceRefine',
  refines: 'net.nanopay.model.BeneficialOwner',

  implements: [
    'net.nanopay.meter.compliance.ComplianceAware'
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      documentation: 'Operations approval status for beneficial owner.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      sheetsOutput: true
    }
  ]
});
