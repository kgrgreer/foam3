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
      documentation: 'Admin user account approval status.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      section: 'administrative'
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
      documentation: 'Admin bank account approval status.',
      readPermissionRequired: true,
      writePermissionRequired: true
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
      documentation: 'Beneficial owner compliance status.',
      readPermissionRequired: true,
      writePermissionRequired: true
    }
  ]
});
