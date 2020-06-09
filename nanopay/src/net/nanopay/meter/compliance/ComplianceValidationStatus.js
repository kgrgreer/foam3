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

foam.ENUM({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceValidationStatus',

  documentation: 'Compliance validation status (Pending, Validated, Investigating, Rejected, Approved, Reinvestigating)',

  values: [
    { name: 'PENDING', label: 'Pending' },
    { name: 'VALIDATED', label: 'Validated' },
    { name: 'INVESTIGATING', label: 'Investigating' },
    { name: 'REJECTED', label: 'Rejected' },
    { name: 'APPROVED', label: 'Approved' },
    { name: 'REINVESTIGATING', label: 'Reinvestigating' }
  ]
});
